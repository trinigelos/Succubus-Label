# Instrucciones para Claude Code

Vas a construir la tienda online de Succubus Label: tienda pública + panel privado de administración.

## Lee antes de escribir código
1. `docs/SPEC.md`: la especificación completa. Manda sobre cualquier suposición tuya.
2. `docs/design/*.dc.html`: la referencia visual exacta de cada pantalla. Ábrelas en el navegador. Los `{{...}}`, `<sc-if>` y `<sc-for>` son sintaxis del editor de diseño: describen estados y listas, no son código para copiar.

## Reglas
- Stack: **Next.js (App Router) + TypeScript**, **Supabase** (Postgres, Auth, Storage), **PayPal Orders API v2 + JS SDK**, Resend para emails.
- Todo el texto visible va en **italiano**, como en los diseños. El código y los comentarios, en inglés.
- Usa los tokens de diseño de `docs/SPEC.md` §1 como variables CSS. Nada de colores ni fuentes fuera de esos tokens. Sin border-radius ni sombras.
- **Los importes los calcula siempre el servidor**, en céntimos (int). Nunca te fíes de precios que lleguen del navegador.
- **El stock se reserva en una transacción** al crear el pedido y se libera si el pedido caduca o se cancela (SPEC §6).
- PayPal siempre como **venta comercial**. Nunca implementes ni sugieras pagos de "amigos y familiares".
- Secretos solo en variables de entorno (ver `.env.example`). Nunca subas `.env*` con valores reales.
- `/admin` y `/api/admin/*` protegidos en el servidor: solo emails de `ADMIN_EMAILS`.
- Migraciones SQL versionadas en `supabase/migrations/`, con políticas RLS (SPEC §3).
- Accesibilidad AA y móvil primero, sobre todo en el panel.

## Orden de trabajo (fase 1)
1. Proyecto Next.js, tokens, fuentes, layout (cabecera, footer) y páginas estáticas.
2. Migraciones de Supabase (tablas + RLS) y datos de ejemplo con las fotos de `docs/img/`.
3. Tienda: Home, Shop (filtros), ficha de producto (tallas), carrito (cajón + página).
4. Checkout + PayPal (create/capture/webhook) + transferencia + cron de caducidad.
5. Panel: login con enlace mágico, productos (CRUD + subida de fotos + stock), pedidos (transferencia recibida, enviado + tracking).
6. Emails, páginas legales, SEO.
7. Tests (unitarios de totales y stock; e2e con Playwright en el sandbox de PayPal) y los criterios de aceptación de SPEC §13.

Antes de cada paso, di qué vas a hacer. Al terminar cada uno, comprueba que compila y que los tests pasan.
