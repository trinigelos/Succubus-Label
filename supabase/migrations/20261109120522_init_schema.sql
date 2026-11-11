-- Succubus Label — schema inicial (SPEC.md §3)
create extension if not exists pgcrypto;

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  line text not null check (line in ('lingerie', 'day-to-day')),
  position int not null default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  line text not null check (line in ('lingerie', 'day-to-day')),
  category_id uuid references categories (id) on delete set null,
  price_cents int not null check (price_cents >= 0),
  compare_at_cents int check (
    compare_at_cents is null or compare_at_cents >= price_cents
  ),
  materials text,
  care text,
  -- usado por la Home para elegir los destacados a mano (SPEC §5.1)
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  -- borrado lógico: un producto con pedidos se archiva en vez de borrarse (SPEC §7.1)
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_status_idx on products (status);
create index products_category_id_idx on products (category_id);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  path text not null,
  alt text not null default '',
  -- position 0 = portada
  position int not null default 0
);

create index product_images_product_id_idx on product_images (product_id);

create table variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  size text not null,
  stock int not null default 0 check (stock >= 0),
  active boolean not null default true,
  unique (product_id, size)
);

create index variants_product_id_idx on variants (product_id);

create table related_products (
  product_id uuid not null references products (id) on delete cascade,
  related_id uuid not null references products (id) on delete cascade,
  position int not null default 0,
  primary key (product_id, related_id),
  check (product_id <> related_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  -- se muestra como #1042
  number bigint generated always as identity (start with 1000) unique,
  email text not null,
  phone text,
  shipping_address jsonb not null,
  shipping_method text not null,
  shipping_cents int not null default 0,
  subtotal_cents int not null,
  total_cents int not null,
  payment_method text not null check (payment_method in ('paypal', 'bonifico')),
  paypal_order_id text unique,
  paypal_capture_id text,
  status text not null default 'pending_payment' check (
    status in ('pending_payment', 'paid', 'shipped', 'cancelled', 'refunded')
  ),
  discreet_packaging boolean not null default true,
  tracking_code text,
  -- token del enlace de confirmación: /ordine/[number]?t=[token] (SPEC §5.6)
  confirmation_token uuid not null default gen_random_uuid(),
  reserved_until timestamptz,
  created_at timestamptz not null default now()
);

create index orders_status_idx on orders (status);
create index orders_reserved_until_idx on orders (reserved_until)
where status = 'pending_payment';

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  variant_id uuid references variants (id) on delete set null,
  name_snapshot text not null,
  size_snapshot text not null,
  unit_price_cents int not null,
  qty int not null check (qty > 0)
);

create index order_items_order_id_idx on order_items (order_id);

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  -- 'day-to-day' | 'restock:<variant_id>'
  list text not null,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

create index waitlist_list_idx on waitlist (list);

-- umbral envío gratis, precios de envío, días de reserva de la transferencia…
create table settings (
  key text primary key,
  value jsonb not null
);

create function set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on products
for each row
execute function set_updated_at ();
