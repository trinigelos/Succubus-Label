-- Adds "whatsapp" as a manual/offline payment method alongside "bonifico":
-- the order is reserved the same way, but the customer coordinates payment
-- (for now, a PayPal link sent by hand) over WhatsApp instead of by bank
-- transfer. PayPal checkout stays in the codebase but is disabled in the UI.

alter table orders drop constraint orders_payment_method_check;
alter table orders add constraint orders_payment_method_check
  check (payment_method in ('paypal', 'bonifico', 'whatsapp'));

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
begin
  if p_payment_method not in ('paypal', 'bonifico', 'whatsapp') then
    raise exception 'INVALID_PAYMENT_METHOD';
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

  select jsonb_object_agg(key, value) into v_settings from settings;
  v_shipping_cents := coalesce(
    (v_settings -> 'shipping_rates_cents' ->> p_shipping_method)::int, 0
  );
  v_free_threshold := coalesce(
    (v_settings ->> 'free_shipping_threshold_cents')::int, null
  );
  if v_free_threshold is not null and v_subtotal >= v_free_threshold then
    v_shipping_cents := 0;
  end if;
  v_total := v_subtotal + v_shipping_cents;

  if p_payment_method = 'paypal' then
    v_reserved_until := now() + interval '30 minutes';
  else
    -- bonifico and whatsapp: both are manual/offline confirmations, held
    -- for the same configurable number of days.
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
