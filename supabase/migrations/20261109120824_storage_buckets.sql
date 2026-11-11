-- Bucket público para las fotos de producto (SPEC.md §7.2).
-- El admin sube originales; el servidor las comprime a WebP en 3 tamaños
-- (400/800/1600px) y las guarda aquí vía SUPABASE_SERVICE_ROLE_KEY.
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "product_photos_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'products');

-- Sin policy de insert/update/delete para anon/authenticated: solo la
-- service role (que salta RLS) puede escribir en el bucket.
