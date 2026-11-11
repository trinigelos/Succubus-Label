-- RLS (SPEC.md §3): la tienda solo lee productos publicados.
-- Todas las escrituras (y las lecturas sensibles, como orders) pasan por
-- rutas /api/admin/* o /api/checkout/* protegidas en el servidor, que usan
-- SUPABASE_SERVICE_ROLE_KEY. La service role salta RLS por diseño de
-- Supabase, así que estas tablas no tienen ninguna policy de escritura
-- para los roles "anon"/"authenticated": sin policy + RLS activo = denegado.

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table variants enable row level security;
alter table related_products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table waitlist enable row level security;
alter table settings enable row level security;

-- Categorías: lectura pública (se usan como filtros de la tienda).
create policy "categories_public_read" on categories
for select to anon, authenticated
using (true);

-- Productos: solo los publicados y no archivados son visibles.
create policy "products_public_read_published" on products
for select to anon, authenticated
using (status = 'published' and archived_at is null);

-- Fotos y variantes: visibles solo si el producto al que pertenecen lo es.
create policy "product_images_public_read" on product_images
for select to anon, authenticated
using (
  exists (
    select 1
    from products p
    where p.id = product_images.product_id
      and p.status = 'published'
      and p.archived_at is null
  )
);

create policy "variants_public_read" on variants
for select to anon, authenticated
using (
  exists (
    select 1
    from products p
    where p.id = variants.product_id
      and p.status = 'published'
      and p.archived_at is null
  )
);

create policy "related_products_public_read" on related_products
for select to anon, authenticated
using (
  exists (
    select 1
    from products p
    where p.id = related_products.related_id
      and p.status = 'published'
      and p.archived_at is null
  )
);

-- Ajustes públicos (umbral de envío gratis, precios de envío…).
create policy "settings_public_read" on settings
for select to anon, authenticated
using (true);

-- Lista de espera: cualquiera puede apuntarse, nadie puede leerla desde el
-- navegador (solo el panel, vía service role).
create policy "waitlist_public_insert" on waitlist
for insert to anon, authenticated
with check (true);

-- orders y order_items no tienen ninguna policy pública: ni para leer ni
-- para escribir. Se crean y se consultan siempre desde el servidor
-- (cálculo de totales, reserva de stock, token de confirmación).
