-- v3 changes (docs/CAMBIOS.md): Outlet section, Express + hand-delivery
-- shipping, and chip-based care instructions. PayPal and the bank-transfer
-- receipt/discount-code flow from CAMBIOS §4/4.1 are intentionally skipped —
-- the store keeps the existing WhatsApp-only payment flow.

alter table products add column if not exists is_outlet boolean not null default false;
alter table products add column if not exists collection text;
alter table products add column if not exists care_tags text[] not null default '{}';
alter table products add column if not exists care_note text;

alter table products drop constraint if exists products_outlet_requires_discount;
alter table products add constraint products_outlet_requires_discount
  check (
    not is_outlet
    or (compare_at_cents is not null and compare_at_cents > price_cents)
  );

-- `care` is replaced by care_tags + care_note (CAMBIOS §6).
alter table products drop column if exists care;

create index if not exists products_is_outlet_idx on products (is_outlet);

-- Shipping settings: Express Italia/Europa + hand delivery in Reggio Emilia,
-- replacing the old flat "standard/express/europe" rates (CAMBIOS §3, §9).
insert into settings (key, value) values
  ('shipping_prices', '{"express_it": 500, "express_eu": 1200, "hand_re": 0}'::jsonb),
  ('hand_delivery_caps', '["42121", "42122", "42123", "42124"]'::jsonb),
  ('upsell_product_ids', '[]'::jsonb)
on conflict (key) do update set value = excluded.value;

delete from settings where key = 'shipping_rates_cents';

-- reserve_order: validate the new shipping methods, gate hand-delivery by
-- CAP, and price from settings.shipping_prices instead of the old key.
-- Payment method handling is unchanged (still 'paypal' | 'bonifico' |
-- 'whatsapp' per the previous migration — paypal/bonifico just aren't
-- offered in the UI).
create or replace function reserve_order(
  p_email text,
  p_phone text,
  p_shipping_address jsonb,
  p_shipping_method text,
  p_payment_method text,
  p_discreet_packaging boolean,
  p_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_variant record;
  v_qty int;
  v_subtotal int := 0;
  v_shipping_cents int := 0;
  v_free_threshold int;
  v_total int := 0;
  v_rows_updated int;
  v_settings jsonb;
  v_reserve_days int;
  v_reserved_until timestamptz;
  v_snapshots jsonb := '[]'::jsonb;
  v_order_id uuid;
  v_order_number bigint;
  v_token uuid;
  v_snapshot jsonb;
  v_hand_delivery_caps jsonb;
  v_cap text;
begin
  if p_payment_method not in ('paypal', 'bonifico', 'whatsapp') then
    raise exception 'INVALID_PAYMENT_METHOD';
  end if;

  if p_shipping_method not in ('express_it', 'express_eu', 'hand_re') then
    raise exception 'INVALID_SHIPPING_METHOD';
  end if;

  select jsonb_object_agg(key, value) into v_settings from settings;

  if p_shipping_method = 'hand_re' then
    v_hand_delivery_caps := coalesce(v_settings -> 'hand_delivery_caps', '[]'::jsonb);
    v_cap := p_shipping_address ->> 'postalCode';
    if v_cap is null or not (v_hand_delivery_caps ? v_cap) then
      raise exception 'HAND_DELIVERY_NOT_AVAILABLE';
    end if;
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item ->> 'qty')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'INVALID_QTY';
    end if;

    select v.id, v.size, v.stock, v.active, p.price_cents, p.name,
           p.status, p.archived_at
      into v_variant
      from variants v
      join products p on p.id = v.product_id
      where v.id = (v_item ->> 'variant_id')::uuid;

    if not found
      or v_variant.status <> 'published'
      or v_variant.archived_at is not null
      or not v_variant.active
    then
      raise exception 'OUT_OF_STOCK:%', v_item ->> 'variant_id';
    end if;

    update variants
      set stock = stock - v_qty
      where id = v_variant.id and stock >= v_qty;
    get diagnostics v_rows_updated = row_count;
    if v_rows_updated = 0 then
      raise exception 'OUT_OF_STOCK:%', v_item ->> 'variant_id';
    end if;

    v_subtotal := v_subtotal + v_variant.price_cents * v_qty;
    v_snapshots := v_snapshots || jsonb_build_object(
      'variant_id', v_variant.id,
      'name_snapshot', v_variant.name,
      'size_snapshot', v_variant.size,
      'unit_price_cents', v_variant.price_cents,
      'qty', v_qty
    );
  end loop;

  v_shipping_cents := coalesce(
    (v_settings -> 'shipping_prices' ->> p_shipping_method)::int, 0
  );
  v_free_threshold := coalesce(
    (v_settings ->> 'free_shipping_threshold_cents')::int, null
  );
  if p_shipping_method <> 'hand_re'
    and v_free_threshold is not null
    and v_subtotal >= v_free_threshold
  then
    v_shipping_cents := 0;
  end if;
  v_total := v_subtotal + v_shipping_cents;

  if p_payment_method = 'paypal' then
    v_reserved_until := now() + interval '30 minutes';
  else
    v_reserve_days := coalesce((v_settings ->> 'bank_transfer_reserve_days')::int, 3);
    v_reserved_until := now() + (v_reserve_days || ' days')::interval;
  end if;

  insert into orders (
    email, phone, shipping_address, shipping_method, shipping_cents,
    subtotal_cents, total_cents, payment_method, status,
    discreet_packaging, reserved_until
  ) values (
    p_email, p_phone, p_shipping_address, p_shipping_method, v_shipping_cents,
    v_subtotal, v_total, p_payment_method, 'pending_payment',
    p_discreet_packaging, v_reserved_until
  )
  returning id, number, confirmation_token into v_order_id, v_order_number, v_token;

  for v_snapshot in select * from jsonb_array_elements(v_snapshots)
  loop
    insert into order_items (
      order_id, variant_id, name_snapshot, size_snapshot,
      unit_price_cents, qty
    ) values (
      v_order_id,
      (v_snapshot ->> 'variant_id')::uuid,
      v_snapshot ->> 'name_snapshot',
      v_snapshot ->> 'size_snapshot',
      (v_snapshot ->> 'unit_price_cents')::int,
      (v_snapshot ->> 'qty')::int
    );
  end loop;

  return jsonb_build_object(
    'order_id', v_order_id,
    'number', v_order_number,
    'token', v_token,
    'subtotal_cents', v_subtotal,
    'shipping_cents', v_shipping_cents,
    'total_cents', v_total,
    'reserved_until', v_reserved_until
  );
end;
$$;
