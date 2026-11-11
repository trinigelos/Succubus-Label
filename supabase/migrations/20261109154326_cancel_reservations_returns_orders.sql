-- Replaces cancel_expired_reservations(): now returns the cancelled
-- orders (id, number, email) so the caller can send the cancellation
-- email (SPEC §6.2, §6.3).
drop function if exists cancel_expired_reservations();

create function cancel_expired_reservations()
returns table (id uuid, number bigint, email text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
begin
  create temp table _cancelled (id uuid, number bigint, email text) on commit drop;

  for v_order in
    select o.id, o.number, o.email from orders o
    where o.status = 'pending_payment' and o.reserved_until < now()
    for update skip locked
  loop
    update variants v
      set stock = v.stock + oi.qty
      from order_items oi
      where oi.order_id = v_order.id and oi.variant_id = v.id;

    update orders set status = 'cancelled' where id = v_order.id;
    insert into _cancelled values (v_order.id, v_order.number, v_order.email);
  end loop;

  return query select * from _cancelled;
end;
$$;

revoke execute on function cancel_expired_reservations() from public;
grant execute on function cancel_expired_reservations() to service_role;
