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
| `panel.html` | Panel privado: solicitudes, agenda, reseñas, conversión (login con Google) |
| `agendar.html` | Agenda pública de citas a domicilio (lun–sáb, por horas) |
| `api/notify.js`, `avisar.js`, `package.json` | Avisos por email + push cuando entra lead/cita/reseña |
| `sw-panel.js` | Service worker del panel para notificaciones push |
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
Se gestionan desde `panel.html` (tudominio.com/panel): login con
Google, lista en tiempo real, cambio de estado, llamar/WhatsApp con
un toque, ver fotos, buscar, filtrar y exportar CSV.

Para activarlo:
1. Firebase → Authentication → Sign-in method → activar **Google**.
2. Firebase → Authentication → Settings → Dominios autorizados →
   agregar el dominio del sitio.
3. En `firestore-rules.txt`, poner el correo de Google del cliente en
   `CORREO-ADMIN@gmail.com` y publicar las reglas. **Volver a publicarlas
   cada vez que se actualice este archivo.**
4. Firestore pedirá crear un índice compuesto la primera vez que la
   página cargue reseñas (visible + fecha): aceptar el enlace que sale
   en la consola del navegador o crearlo en Firestore → Índices.

Medición de embudo: cada clic en Cotizar/Llamar/WhatsApp/Email/TikTok
y cada lead enviado se registra en la colección `clicks` (solo cuando
Firebase está configurado). Sirve para saber qué canal convierte.

## Avisos (email + push) — variables de entorno en Vercel

| Variable | Qué es |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | JSON completo de la cuenta de servicio (Firebase → Configuración → Cuentas de servicio → Generar clave) |
| `RESEND_API_KEY` | Clave de resend.com (gratis hasta 3,000 correos/mes) |
| `CORREO_AVISOS` | Correo que recibe los avisos |
| `VAPID_PUBLICA` / `VAPID_PRIVADA` | Generar con `npx web-push generate-vapid-keys`. La pública también va en `config.js` → `vapidPublica` |
| `DOMINIO` | `https://tudominio.com` (para el enlace al panel en el correo) |

Push: en el panel aparece "Activar avisos" cuando `vapidPublica` está puesta.
En iPhone el panel debe estar agregado a la pantalla de inicio para recibir push.

## Agenda

Horario configurado en `agendar.html` (DEF): lun/mié/vie 8:00–18:30,
mar/jue/sáb 8:00–19:00, citas cada hora de 60 min, anticipación 5 h,
30 días de ventana. Desde el panel se bloquean días completos. Cada
cita entra como **pendiente** hasta que J & Y la confirme por WhatsApp
o llamada (botón en el panel con mensaje listo). Cancelar libera el horario.

## Reseñas

Los clientes las envían desde "Deja tu reseña"; entran ocultas y
se publican desde el panel (pestaña Reseñas), donde también se pueden
editar, agregar/quitar fotos (cliente y pieza) o cargar manualmente
reseñas recibidas por WhatsApp/TikTok. La sección del sitio no aparece
hasta que exista la primera publicada. `index.html?demo=resenas`
muestra 3 ejemplos de diseño, marcados como tal y no publicados.

## Pendientes (datos no proporcionados)

- Dominio definitivo.
- ~~WhatsApp~~ CONFIRMADO: botón flotante, CTA en contacto y en el
  fallback del formulario, con mensaje precargado (config.js).
- ~~Redes~~ TikTok agregado: @romerojesus071 (footer, contacto, schema).
- Reseñas reales: el sistema está completo; la sección se activa
  con la primera reseña publicada desde el panel.
- Método de evaluación de piezas → las respuestas del FAQ son prudentes
  a propósito; se pueden precisar cuando J & Y confirme su proceso.
- Versión en inglés: la arquitectura lo permite (duplicar index como
  `/en/` + hreflang). No se muestran controles de idioma sin contenido.
