# Succubus Label — tienda online

Tienda online de **Succubus Label** (@succubus.label_17.10): *The black label of lingerie*.

> **Estado: punto de partida.** Este repositorio contiene todavía **solo los diseños y la especificación**. La web se construye con Claude Code siguiendo `CLAUDE.md`.

## Qué hay aquí

```
CLAUDE.md          instrucciones para Claude Code (léelas primero)
docs/SPEC.md       especificación completa: stack, datos, pagos, panel, legal
docs/design/       las 9 pantallas diseñadas (abrir en el navegador como referencia)
docs/img/          fotos provisionales de baja resolución (sustituir por los originales)
.env.example       variables de entorno necesarias (sin valores reales)
```

## Cómo se pone en marcha

1. **Construir:** abre esta carpeta con Claude Code y pídele: *"Lee CLAUDE.md y construye la fase 1"*.
2. **Servicios que hay que crear** (cuentas a nombre de la marca):
   - [Supabase](https://supabase.com): base de datos, login del panel y fotos
   - [PayPal Developer](https://developer.paypal.com): credenciales de la cuenta **PayPal Business** (primero sandbox, luego live)
   - [Resend](https://resend.com) u otro servicio: emails de pedidos
   - [Vercel](https://vercel.com) u otro hosting compatible con Next.js: plan de pago, porque es una tienda
   - Un dominio (por ejemplo succubuslabel.it)
3. **Publicar:** conecta este repositorio a Vercel. Cada vez que se sube un cambio a GitHub, la web se actualiza sola.
4. **Las claves secretas** (PayPal, Supabase, IBAN…) se ponen en el panel de Vercel, **nunca** en el repositorio.

## Quién usa qué

| Quién | Dónde | Cómo entra |
|---|---|---|
| Clientas | `https://[dominio]/` | Sin cuenta: compran y pagan con PayPal o transferencia |
| Ella (admin) | `https://[dominio]/admin` | Enlace mágico a su email (solo los emails de `ADMIN_EMAILS`) |
