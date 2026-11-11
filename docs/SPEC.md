# Succubus Label — Especificación del e-commerce (v2, a medida)

Documento de traspaso para que **Claude Code** construya la tienda online de **Succubus Label** (@succubus.label_17.10) **sin Shopify**: una web propia con pagos por **PayPal** y **transferencia bancaria**, y un **panel privado** donde ella gestiona productos, stock y pedidos.

Todo el texto visible del sitio y del panel va en **italiano**. Este documento está en español.

Junto a este archivo:
- `docs/design/*.dc.html`: las 9 pantallas diseñadas, en HTML con estilos inline. Son la **referencia visual exacta**: colores, tipografías, espaciados y textos. (`{{...}}`, `<sc-if>` y `<sc-for>` son sintaxis del editor de diseño: plantillas y estados. Interpretarlas como lógica, no copiarlas.)
  - Tienda: `Main`, `Shop`, `Prodotto`, `Carrello`, `Checkout`, `Conferma`
  - Panel: `Admin-Prodotti`, `Admin-Prodotto`, `Admin-Ordini`
- `docs/img/`: fotos provisionales recortadas de Instagram, **de baja resolución**. Sustituirlas por los originales.

---

## 1. Marca y tokens

| | |
|---|---|
| Claim | *The black label of lingerie* · *Intimates & noir aesthetics* |
| Tono | Oscuro, elegante, auténtico, con un punto irónico. Nunca exagerado. |
| Líneas | **Lingerie** (a la venta) · **Day to day** (ropa diaria, a punto de salir) |

```css
--bg:#000000; --text:#F2F0ED; --text-2:#C4C0BA; --muted:#A6A29C;
--line:#1E1E1E; --border:#3A3A3A; --disabled:#6E6B66; --error:#FF8F8F;
--panel-active:#1A1A1A;  /* fondo del elemento activo del menú del panel */

--font-display:'Playfair Display', serif;  /* logo y títulos */
--font-impact:'Archivo', sans-serif;       /* font-stretch:125%; 800; MAYÚSCULAS */
--font-body:'Inter Tight', sans-serif;     /* 300 cuerpo; 400/500 botones */
```

- **Recurso de la marca**: una línea en Playfair *cursiva* + una línea en Archivo ancha y en mayúsculas (*Black is* / **A CHOICE**). Solo en títulos de sección.
- Sin border-radius, sin sombras, sin degradados, sin emojis. Bordes de 1px. Botón primario: fondo `--text` con texto negro. Secundario: borde 1px.
- Fotos en proporción 4:5 con `object-fit: cover`.

---

## 2. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Web + API | **Next.js (App Router) + TypeScript** | Un solo proyecto para tienda, panel y endpoints de pago |
| Base de datos, login y archivos | **Supabase** (Postgres + Auth + Storage) | Productos, stock, pedidos, login del panel y fotos, todo en un servicio. Plan gratuito al empezar |
| Pagos | **PayPal Checkout** (JS SDK + REST Orders API v2) | Es lo que ella ya usa. Acepta también tarjeta sin cuenta de PayPal |
| Transferencia | Flujo propio (ver §6.2) | 0 % de comisión |
| Emails | Resend (o similar) + plantillas React Email | Confirmación, datos de transferencia, envío con tracking y avisos |
| Hosting | Vercel Pro (el plan gratuito no admite uso comercial) u otro host compatible con Next.js | |
| Legal | iubenda (privacy, cookies, términos) | |

**Variables de entorno**: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_ENV` (sandbox|live), `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_EMAILS`, `IBAN`, `IBAN_HOLDER`, `SHOP_URL`.

---

## 3. Modelo de datos (Postgres)

```sql
products (
  id uuid pk, slug text unique, name text, description text,
  line text check (line in ('lingerie','day-to-day')),
  category_id uuid fk, price_cents int, compare_at_cents int null,
  materials text, care text,
  status text check (status in ('draft','published')) default 'draft',
  created_at timestamptz, updated_at timestamptz
)
categories (id uuid pk, name text, slug text unique, line text, position int)
product_images (id uuid pk, product_id fk, path text, alt text, position int)   -- position 0 = portada
variants (id uuid pk, product_id fk, size text,          -- 'XS'..'XL' o 'Unica'
          stock int check (stock >= 0), active bool)
related_products (product_id fk, related_id fk, position int)

orders (
  id uuid pk, number serial unique,                       -- se muestra como #1042
  email text, phone text, shipping_address jsonb,
  shipping_method text, shipping_cents int, subtotal_cents int, total_cents int,
  payment_method text check (payment_method in ('paypal','bonifico')),
  paypal_order_id text unique null, paypal_capture_id text null,
  status text check (status in
    ('pending_payment','paid','shipped','cancelled','refunded')),
  discreet_packaging bool default true, tracking_code text null,
  reserved_until timestamptz null, created_at timestamptz
)
order_items (id pk, order_id fk, variant_id fk, name_snapshot text,
             size_snapshot text, unit_price_cents int, qty int)

waitlist (id pk, email text, list text,                  -- 'day-to-day' | 'restock:<variant_id>'
          consent bool, created_at timestamptz)
settings (key text pk, value jsonb)                       -- umbral envío gratis, precios de envío, días de reserva…
```

- **Etiquetas automáticas** (se calculan, no se guardan): `Nuovo` = publicado hace menos de 30 días · `Ultimi pezzi` = stock total ≤ 3 · `Esaurito` = stock total 0.
- **Precios siempre en céntimos** (int). El servidor calcula todos los totales; **nunca se fía de importes enviados por el navegador**.
- **Seguridad (RLS)**: la tienda solo puede leer productos con `status='published'`. Escribir en cualquier tabla solo pueden hacerlo los usuarios autenticados cuyo email esté en `ADMIN_EMAILS`, o el servidor con la service role.

---

## 4. Mapa del sitio

| Ruta | Pantalla | Diseño |
|---|---|---|
| `/` | Home | `Main` |
| `/shop` (`?categoria=`, `?taglia=`, `?ordina=`) | Tienda | `Shop` |
| `/prodotto/[slug]` | Ficha de producto | `Prodotto` |
| `/carrello` + cajón lateral | Carrito | `Carrello` |
| `/checkout` | Checkout | `Checkout` |
| `/ordine/[number]?t=[token]` | Confirmación | `Conferma` |
| `/admin` | Productos y stock | `Admin-Prodotti` |
| `/admin/prodotti/nuovo`, `/admin/prodotti/[id]` | Crear o editar producto | `Admin-Prodotto` |
| `/admin/ordini` | Pedidos | `Admin-Ordini` |
| `/admin/login` | Login por enlace mágico enviado a su email | sin diseño: misma estética, centrado |
| `/admin/lista-attesa`, `/admin/impostazioni` | Lista de espera (exportar CSV) · Ajustes de envío, IBAN y umbral | fase 2 |
| `/guida-taglie`, `/spedizioni-resi`, `/privacy`, `/termini`, `/cookie` | Páginas de texto | mismo estilo que la ficha |

---

## 5. Tienda: comportamiento

### 5.1 Home (`Main`)
Hero (logo + 3 fotos escalonadas + CTA) → manifiesto *Black is A CHOICE* → 4 productos destacados (los 4 publicados más recientes, o elegidos con un campo `featured`) → **Day to day** con formulario "Avvisami" (→ `waitlist`, list `day-to-day`) → Chi sono → 3 detalles → 6 fotos de Instagram (elegidas a mano en `settings` en la fase 1) → footer.

### 5.2 Tienda (`Shop`)
- Chips de categoría que filtran sin recargar y actualizan la URL. Desplegables Taglia (solo variantes con stock) y Ordina (Novità, Prezzo ↑, Prezzo ↓).
- Rejilla `repeat(auto-fill,minmax(260px,1fr))`; en móvil, 2 columnas con gap de 12px.
- Tarjeta: foto + etiqueta + nombre + precio + tallas disponibles + "+ Aggiungi". Con talla única añade directamente; con varias tallas abre un selector rápido. Si está agotado: foto al 45 % + "Avvisami" (→ `waitlist`, list `restock:<variant_id>`).

### 5.3 Ficha (`Prodotto`)
- Galería con miniaturas (carrusel en móvil). Talla **obligatoria**: sin talla, mensaje "Scegli una taglia per continuare." (`role="alert"`). Tallas sin stock: tachadas y `disabled`.
- Al añadir: se actualiza el contador y se abre el cajón del carrito. Acordeones: Dettagli e materiali, Spedizioni e resi, Cura del capo. Guía de tallas en un panel. "Completa il look" con 4 productos relacionados.
- Móvil: barra fija abajo con precio + "Aggiungi". Datos estructurados Product (JSON-LD).

### 5.4 Carrito (`Carrello`)
- Se guarda en `localStorage` (variantes y cantidades) y se **revalida con el servidor** al abrirlo: precios actuales y stock disponible.
- Cantidad −/+ (máximo = stock), eliminar, carrito vacío, barra de envío gratis (umbral en `settings`), casilla **Imballo discreto** (marcada por defecto).
- "Vai al checkout". Debajo: "PayPal (anche con carta) · Bonifico bancario".

### 5.5 Checkout (`Checkout`)
Una sola página: Contatto → Indirizzo (formato italiano, `autocomplete` correcto) → Spedizione (Standard 24/48h, Express, Europa; precios en `settings`) → Pagamento (**PayPal** o **Bonifico**) + aceptación obligatoria de Termini/Privacy. Resumen a la derecha (abajo y plegable en móvil). El flujo de pago está en §6.

### 5.6 Confirmación (`Conferma`)
*Grazie.* / **È TUO.**, número de pedido, estado (Confermato → In preparazione → Spedito → Consegnato), resumen. Si pagó por transferencia, además: IBAN, titular, importe y concepto (`Ordine #1042`) bien visibles, con botón de copiar. Para mostrar el pedido se exige el token del enlace (`?t=`), para que nadie vea pedidos ajenos cambiando el número.

---

## 6. Pagos

### 6.1 PayPal (Orders API v2)
1. El navegador renderiza los **PayPal Buttons** (JS SDK, `intent=capture`, `currency=EUR`, `locale=it_IT`). Permiten pagar con cuenta de PayPal o con tarjeta.
2. `createOrder` → `POST /api/checkout/paypal/create`. El servidor:
   - valida carrito, dirección y método de envío y recalcula precios y total desde la base de datos;
   - **reserva el stock** en una transacción (`UPDATE variants SET stock = stock - qty WHERE id = … AND stock >= qty`; si alguna línea falla → 409 "Taglia non più disponibile");
   - crea el `order` en estado `pending_payment` con `reserved_until = now() + 30 min`;
   - crea la orden en PayPal (`purchase_units` con importes desglosados, `custom_id = order.id`, `shipping_preference = SET_PROVIDED_ADDRESS` con la dirección ya introducida) y devuelve el `id` de PayPal.
3. `onApprove` → `POST /api/checkout/paypal/capture` → el servidor captura. Si el resultado es `COMPLETED`: estado `paid`, se guarda `paypal_capture_id`, se envía el email de confirmación y se redirige a `/ordine/[n]?t=`.
4. **Webhook** `POST /api/webhooks/paypal` (verificar la firma con `PAYPAL_WEBHOOK_ID`): `PAYMENT.CAPTURE.COMPLETED` → `paid`, idempotente, por si el navegador se cierra antes del paso 3. `PAYMENT.CAPTURE.REFUNDED` → `refunded` y se devuelve el stock.
5. `onCancel`/`onError` → mensaje en el checkout. La reserva caduca sola (§6.3).
- Todo se prueba en **sandbox** antes de pasar a `live`.
- ⚠️ El pago siempre es una **venta comercial** (comisión estándar en Italia: 3,40 % + 0,35 €). No usar ni sugerir "amigos y familiares": va contra las condiciones de PayPal y deja a la clienta sin protección.

### 6.2 Transferencia bancaria
1. `POST /api/checkout/bonifico`: se valida, se recalcula, **se reserva el stock** y se crea el pedido `pending_payment` con `reserved_until = now() + N días` (N en `settings`; por ejemplo 3).
2. Se envía un email con IBAN, titular, importe exacto y concepto `Ordine #<number>`, y se muestran los mismos datos en la confirmación.
3. En `Admin-Ordini`, ella pulsa **"Bonifico ricevuto"** → `paid` + email de confirmación.
4. Si no llega a tiempo → se cancela y se libera el stock (§6.3), con un email de aviso a la clienta (y un recordatorio opcional 24 h antes).

### 6.3 Caducidad de reservas
Un cron (Vercel Cron o Supabase `pg_cron`) cada 10 minutos: los pedidos `pending_payment` con `reserved_until < now()` pasan a `cancelled` y **devuelven el stock** de sus líneas, en una transacción.

---

## 7. Panel de ella (`/admin`)

**Acceso**: login con **enlace mágico** (Supabase Auth). Solo entran los emails de `ADMIN_EMAILS`; cualquier otro recibe 404. Todas las rutas `/admin` y `/api/admin/*` comprueban la sesión en el servidor. Se diseña **primero para móvil**, porque es probable que ella lo use desde el teléfono: el menú lateral pasa a ser una fila de botones arriba y las tablas se desplazan dentro de su caja.

### 7.1 Productos (`Admin-Prodotti`)
- 3 tarjetas de resumen: **Da spedire** (pedidos `paid`), **Taglie esaurite** (variantes activas con stock 0), **Vendite questo mese** (suma de `paid` + `shipped`).
- Filtros: Tutti · Pubblicati · Bozze · Esauriti + buscador por nombre.
- Tabla: miniatura · nombre · categoría · precio · **stock por talla** (chips "M 3"; a 0 en rojo `--error`) · estado · Modifica / Elimina.
- **Eliminar** abre un diálogo de confirmación ("Sparisce dal negozio e non si può recuperare. Se vuoi solo nasconderlo, mettilo in Bozza."). Si el producto tiene pedidos, se hace **borrado lógico** (archivado) para no romper el historial.
- Botón "+ Nuovo prodotto".

### 7.2 Crear o editar producto (`Admin-Prodotto`)
- **Fotos**: subir varias o arrastrarlas (en móvil, desde la galería o la cámara). En el servidor se comprimen a WebP en 3 tamaños (400/800/1600 px) y se guardan en Supabase Storage. Se ordenan arrastrando; la primera es la **portada**; × para quitar. Formatos aceptados: jpg, png, heic y webp, hasta 15 MB.
- **Informazioni**: nombre (el `slug` se genera solo), descripción, línea, categoría (con opción "+ Nuova categoria…"), precio con IVA y precio rebajado opcional.
- **Taglie e stock**: una fila por talla (XS–XL) con casilla de activa/inactiva y stepper −/+ (también se puede escribir el número). Avisos "Quasi finita" (≤ 2) y "Esaurita" (0). Opción "Taglia unica" para accesorios. Total de piezas arriba.
- **Dettagli**: materiales, cuidados, "Completa il look" (selector de hasta 4 productos).
- **Salva bozza** / **Pubblica** con mensaje de confirmación. A la derecha, **vista previa en vivo** de la tarjeta de la tienda: nombre, precio, etiqueta y tallas.
- Validación: no se puede publicar sin nombre, precio y al menos 1 foto.
- Si se edita el stock mientras hay reservas activas, el número mostrado es el **stock disponible** (ya descontadas las reservas).

### 7.3 Pedidos (`Admin-Ordini`)
- Filtros: Tutti · Da pagare (transferencias pendientes) · Da spedire · Spediti, con contadores. Insignia en el menú con `Da pagare + Da spedire`.
- Fila desplegable: número, clienta, fecha, nº de artículos, método de pago y estado.
- Al desplegar: dirección y teléfono, etiqueta **"Imballo discreto"** bien visible, artículos con talla, total y método de envío, y la acción según el estado:
  - `pending_payment` (transferencia) → **"Bonifico ricevuto"**
  - `paid` → campo **número de tracking** + **"Segna come spedito"** → `shipped` + email a la clienta con el enlace de seguimiento
  - `shipped` → muestra el tracking.
- Fase 2: imprimir albarán, reembolso parcial o total vía API de PayPal y exportar a CSV para la contabilidad.

---

## 8. Emails (italiano, fondo negro, logo y Playfair)
1. Pedido confirmado (PayPal o transferencia recibida)
2. Datos para la transferencia + recordatorio + cancelación por falta de pago
3. Pedido enviado con tracking
4. Producto de nuevo disponible (`waitlist restock:`)
5. Bienvenida a la lista de Day to day y aviso del lanzamiento
6. Aviso interno a ella: "Nuovo ordine #…"

---

## 9. Legal (Italia/UE)
> Puntos para validar con su gestor. No es asesoramiento legal.
- Derecho de desistimiento de 14 días, con excepción por **higiene** para la lencería desprecintada: hace falta un precinto o etiqueta de higiene y explicarlo en la ficha, el carrito y la política.
- En el footer: razón social, **P.IVA**, dirección y email.
- Privacy (RGPD), cookies con **consentimiento previo** para analítica y marketing, términos de venta.
- Precios con IVA incluida. Embalaje neutro, sin logo y sin descripción del contenido por fuera.

---

## 10. Requisitos no funcionales
- Responsive de 1440 a 375 px, sin scroll horizontal. Panel pensado primero para móvil.
- Accesibilidad AA: objetivos táctiles ≥ 44px, `alt` en las fotos, foco visible, ARIA como en los diseños, diálogos y cajón con gestión del foco.
- Imágenes con `next/image` en WebP/AVIF, lazy loading excepto el hero, fuentes con `next/font`. Objetivo: Lighthouse móvil ≥ 90.
- SEO en italiano: metadatos por página, Open Graph, JSON-LD de Product y Organization, sitemap.
- Seguridad: totales siempre calculados en el servidor, webhooks firmados, RLS, límite de peticiones en el login y el checkout, y nunca guardar datos de tarjetas (los gestiona PayPal).
- Tests: unitarios para el cálculo de totales y la reserva/liberación de stock; e2e (Playwright) para el flujo de compra en el sandbox de PayPal y para crear un producto en el panel.

---

## 11. Fases
**Fase 1 (lanzamiento)**: tienda completa, PayPal + transferencia, reservas, panel (productos, stock, pedidos, tracking), emails 1–3 y 6, legal y lista de Day to day.
**Fase 2**: avisos de reposición, códigos de descuento, ajustes editables desde el panel, reembolsos desde el panel, exportar a CSV y feed automático de Instagram.

---

## 12. Contenido pendiente (pedírselo a ella)
- [ ] Fotos originales (mínimo 1600 px de ancho) y logo en SVG
- [ ] Catálogo: nombres, precios, tallas y stock (ella misma lo puede cargar en el panel)
- [ ] Tabla de medidas
- [ ] Transportista, precios de envío, umbral de envío gratis y días de reserva para la transferencia
- [ ] IBAN y titular de la cuenta; cuenta **PayPal Business** (las credenciales API las da PayPal Developer)
- [ ] Política de devoluciones definitiva
- [ ] Fecha y categorías de Day to day
- [ ] Texto de "Chi sono"
- [ ] Email de contacto, P.IVA, razón social, enlace de Vinted y dominio

---

## 13. Criterios de aceptación
1. Las 9 pantallas coinciden con `design/` a 1440 px y se ven bien a 375 px.
2. No se puede añadir un producto sin elegir talla; las tallas sin stock no se pueden seleccionar.
3. Dos compras simultáneas de la última unidad: solo una lo consigue y la otra ve "Taglia non più disponibile".
4. Pago en el sandbox de PayPal: pedido `paid`, stock descontado, emails a la clienta y a ella. Si se cierra la ventana antes de volver, el webhook igualmente lo marca como pagado.
5. Transferencia: pedido `pending_payment` con el stock reservado. "Bonifico ricevuto" lo pasa a `paid`. Si caduca, se cancela y el stock vuelve.
6. Desde el panel ella puede, en el móvil, crear un producto con fotos, tallas y stock, publicarlo y verlo en la tienda en menos de 1 minuto.
7. Al eliminar un producto se pide confirmación. Uno con pedidos se archiva, no se borra.
8. "Segna come spedito" guarda el tracking y envía el email.
9. Sin login no se puede acceder a `/admin` ni a `/api/admin/*`; un email que no esté en `ADMIN_EMAILS` no puede entrar.
10. Ningún píxel de analítica se carga antes del consentimiento de cookies. Lighthouse móvil ≥ 90.
