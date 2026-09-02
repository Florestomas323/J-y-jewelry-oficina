# Oficina Digital · J & Y JEWELRY

Sitio de captación de clientes para la compra de oro y plata en
Dallas, TX y alrededores. Construido sobre la arquitectura de la
plantilla Oficina Digital, con identidad completamente nueva.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Página completa: hero, confianza, propuesta, qué compramos, cómo funciona, domicilio, pagos, nosotros, FAQ, contacto, modal de leads |
| `config.js` | ÚNICO archivo de datos del negocio (teléfono, email, dominio, Firebase) |
| `privacidad.html` / `terminos.html` | Avisos legales propios de J & Y (nuevos, no copiados) |
| `firestore-rules.txt` | Reglas de seguridad para el proyecto Firebase de J & Y |
| `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, `vercel.json` | Infraestructura de despliegue y SEO |
| `assets/` | Logo, hero, textura mármol+oro |

## Antes de publicar — checklist

1. **Dominio**: reemplazar `SUDOMINIO.com` en `config.js`, `index.html`
   (canonical, OG, JSON-LD), `robots.txt`, `sitemap.xml`, `privacidad.html`
   y `terminos.html` con el dominio real.
   `grep -rn "SUDOMINIO" .` debe quedar en cero.
2. **Firebase**: crear proyecto NUEVO exclusivo de J & Y → pegar credenciales
   en `config.js` → publicar `firestore-rules.txt` (cambiando
   `CORREO-ADMIN@gmail.com`). Mientras Firebase no esté configurado, el
   formulario ofrece llamada/email como alternativa (no falla en silencio).
3. **Probar en móvil real**: modal, subir fotos, envío, barra inferior,
   menú, llamadas con tap.
4. Verificar el lead de prueba en Firestore → colección `leads`.

## Leads

Colección `leads`: nombre, teléfono, ciudad, metal, lugar, mensaje,
fotos (máx. 3, comprimidas en base64), estado (`nuevo`), origen, fecha.
Estados sugeridos: nuevo → contactado → cita coordinada → completado.
Por ahora se gestionan desde la consola de Firebase; un panel admin
propio queda como fase 2.

Medición de embudo: cada clic en Cotizar/Llamar/WhatsApp/Email/TikTok
y cada lead enviado se registra en la colección `clicks` (solo cuando
Firebase está configurado). Sirve para saber qué canal convierte.

## Pendientes (datos no proporcionados)

- Dominio definitivo.
- ~~WhatsApp~~ CONFIRMADO: botón flotante, CTA en contacto y en el
  fallback del formulario, con mensaje precargado (config.js).
- ~~Redes~~ TikTok agregado: @romerojesus071 (footer, contacto, schema).
- Testimonios reales → la sección está preparada pero oculta
  (comentario en index.html). No publicar reseñas inventadas.
- Método de evaluación de piezas → las respuestas del FAQ son prudentes
  a propósito; se pueden precisar cuando J & Y confirme su proceso.
- Versión en inglés: la arquitectura lo permite (duplicar index como
  `/en/` + hreflang). No se muestran controles de idioma sin contenido.
