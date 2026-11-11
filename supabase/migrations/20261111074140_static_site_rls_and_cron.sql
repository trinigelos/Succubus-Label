-- Moves the app from "server + service role" to "static site + RLS".
-- There is no server anymore: every write from the admin panel happens
-- directly from the browser, authenticated as a Supabase Auth user. This
-- migration is what actually enforces "only an admin can change things" —
-- not anything in the client code.

create table app_admins (
  email text primary key
);

alter table app_admins enable row level security;

create policy "app_admins_self_read" on app_admins
for select to authenticated
using (email = auth.jwt() ->> 'email');

-- Reusable admin check. security definer so it can read app_admins
-- regardless of that table's own RLS.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from app_admins where email = auth.jwt() ->> 'email'
  );
$$;

-- Catalog: admins get full read/write in addition to the existing public
-- read-only policies (multiple permissive policies are OR'd together).
create policy "products_admin_all" on products
for all to authenticated
using (is_admin())
with check (is_admin());

create policy "categories_admin_all" on categories
for all to authenticated
using (is_admin())
with check (is_admin());

create policy "variants_admin_all" on variants
for all to authenticated
using (is_admin())
with check (is_admin());

create policy "product_images_admin_all" on product_images
for all to authenticated
using (is_admin())
with check (is_admin());

create policy "related_products_admin_all" on related_products
for all to authenticated
using (is_admin())
with check (is_admin());

-- Orders: admins can list them and update status/tracking (mark paid,
-- mark shipped). No insert/delete policy — orders are only ever created
-- through reserve_order(), and are archived, never deleted.
create policy "orders_admin_select" on orders
for select to authenticated
using (is_admin());

create policy "orders_admin_update" on orders
for update to authenticated
using (is_admin())
with check (is_admin());

create policy "order_items_admin_select" on order_items
for select to authenticated
using (is_admin());

-- Storage: admins can manage product photos; everyone else keeps
-- read-only access from the earlier migration.
create policy "product_photos_admin_write" on storage.objects
for all to authenticated
using (bucket_id = 'products' and is_admin())
with check (bucket_id = 'products' and is_admin());

-- reserve_order() is still SECURITY DEFINER: its own logic (atomic stock
-- check, server-side price lookup) is the real protection, not the
-- caller's role. It's now called directly from the browser.
grant execute on function reserve_order(
  text, text, jsonb, text, text, boolean, jsonb
) to anon, authenticated;

-- Replaces the old "read via service role" confirmation page lookup:
-- returns the order (with items) only if the token matches, so nobody can
-- see someone else's order by guessing the number.
create or replace function get_order_confirmation(p_number bigint, p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_items jsonb;
begin
  select * into v_order from orders
    where number = p_number and confirmation_token = p_token;

  if not found then
    return null;
  end if;

  select jsonb_agg(jsonb_build_object(
    'name', oi.name_snapshot,
    'size', oi.size_snapshot,
    'qty', oi.qty,
    'unit_price_cents', oi.unit_price_cents,
    'image_path', (
      select pi.path from variants v
      join product_images pi on pi.product_id = v.product_id
      where v.id = oi.variant_id
      order by pi.position asc
      limit 1
    )
  )) into v_items
  from order_items oi
  where oi.order_id = v_order.id;

  return jsonb_build_object(
    'number', v_order.number,
    'email', v_order.email,
    'phone', v_order.phone,
    'shipping_address', v_order.shipping_address,
    'shipping_method', v_order.shipping_method,
    'payment_method', v_order.payment_method,
    'status', v_order.status,
    'discreet_packaging', v_order.discreet_packaging,
    'subtotal_cents', v_order.subtotal_cents,
    'shipping_cents', v_order.shipping_cents,
    'total_cents', v_order.total_cents,
    'tracking_code', v_order.tracking_code,
    'items', coalesce(v_items, '[]'::jsonb)
  );
end;
$$;

revoke execute on function get_order_confirmation(bigint, uuid) from public;
grant execute on function get_order_confirmation(bigint, uuid) to anon, authenticated;

-- Cron, in Postgres itself (SPEC §6.3 allows pg_cron as an alternative to
-- Vercel Cron) — there is no server left to host an API route for this.
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'expire-reservations',
  '*/10 * * * *',
  $$select cancel_expired_reservations();$$
);

-- Run this once with the real admin email(s) after applying migrations:
--   insert into app_admins (email) values ('tuemail@example.com');
