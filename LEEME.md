# Oficina Digital · J & Y JEWELRY

Sitio de captación de clientes para la compra de oro y plata en
Dallas, TX y alrededores. Construido sobre la arquitectura de la
plantilla Oficina Digital, con identidad completamente nueva.

## Archivos

|Archivo                                                           |Qué es                                                                                                                              |
|------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
|`index.html`                                                      |Página completa: hero, confianza, propuesta, qué compramos, cómo funciona, domicilio, pagos, nosotros, FAQ, contacto, modal de leads|
|`config.js`                                                       |ÚNICO archivo de datos del negocio (teléfono, email, dominio, Firebase)                                                             |
|`privacidad.html` / `terminos.html`                               |Avisos legales propios de J & Y (nuevos, no copiados)                                                                               |
|`firestore-rules.txt`                                             |Reglas de seguridad para el proyecto Firebase de J & Y                                                                              |
|`manifest.webmanifest`, `robots.txt`, `sitemap.xml`, `vercel.json`|Infraestructura de despliegue y SEO                                                                                                 |
|`panel.html`                                                      |Panel privado: solicitudes, agenda, reseñas, conversión (login con Google)                                                          |
|`agendar.html`                                                    |Agenda pública de citas a domicilio (lun–sáb, por horas)                                                                            |
|`api/notify.js`, `avisar.js`, `package.json`                      |Avisos por email + push cuando entra lead/cita/reseña                                                                               |
|`sw-panel.js`                                                     |Service worker del panel para notificaciones push                                                                                   |
|`assets/`                                                         |Logo, hero, textura mármol+oro                                                                                                      |

## Antes de publicar — checklist

1. **Dominio**: hoy todo apunta a `j-y-jewelry-oficina.vercel.app`
   (el sitio en vivo), para que la vista previa al compartir el enlace
   funcione desde ya. Cuando exista el dominio propio, reemplazarlo en
   todos los archivos de una sola pasada:
   
   ```
   grep -rl "j-y-jewelry-oficina.vercel.app" . \
     | xargs sed -i 's/j-y-jewelry-oficina.vercel.app/TUDOMINIO.com/g'
   ```
   
   Afecta a: `index.html`, `agendar.html`, `privacidad.html`,
   `terminos.html`, `panel.html`, `config.js`, `robots.txt`,
   `sitemap.xml` y `api/notify.js` (canonical, Open Graph, JSON-LD,
   sitemap y enlace del correo de avisos).
   
   **Después de cambiar el dominio o la imagen**, refrescar la caché de
   las redes en <https://developers.facebook.com/tools/debug/> (pegar la
   URL y pulsar “Scrape Again”). WhatsApp usa esa misma caché.
1. **Firebase**: proyecto `oro-jesus-romero` ya conectado en `config.js`.
   Publicar `firestore-rules.txt` (ya trae los dos correos con acceso).
   Mientras Firebase no responda, el formulario ofrece llamada/email
   como alternativa (no falla en silencio).
1. **Probar en móvil real**: modal, subir fotos, envío, barra inferior,
   menú, llamadas con tap.
1. Verificar el lead de prueba en Firestore → colección `leads`.

## Leads

Colección `leads`: nombre, teléfono, ciudad, metal, lugar, mensaje,
fotos (máx. 3, comprimidas en base64), estado (`nuevo`), origen, fecha.
Estados sugeridos: nuevo → contactado → cita coordinada → completado.
Se gestionan desde `panel.html` (tudominio.com/panel): login con
Google, lista en tiempo real, cambio de estado, llamar/WhatsApp con
un toque, ver fotos, buscar, filtrar y exportar CSV.

Para activarlo:

1. Firebase → Authentication → Sign-in method → activar **Google**.
1. Firebase → Authentication → Settings → Dominios autorizados →
   agregar el dominio del sitio.
1. Publicar `firestore-rules.txt`. Los correos con acceso al panel ya
   están en la función `esAdmin()`: [cubaromero88@hotmail.com](mailto:cubaromero88@hotmail.com) y
   [florestomas323@gmail.com](mailto:florestomas323@gmail.com). **Volver a publicar las reglas cada vez
   que se actualice este archivo.** Para agregar o quitar un correo,
   se edita esa lista y se vuelve a publicar.
   OJO: el login es con Google. Un correo @hotmail.com solo funciona
   si existe una cuenta de Google creada con ese correo
   (accounts.google.com → Crear cuenta → “Usar mi dirección de correo
   actual”). Si no, entrar con un Gmail y agregarlo a la lista.
1. Firestore pedirá crear un índice compuesto la primera vez que la
   página cargue reseñas (visible + fecha): aceptar el enlace que sale
   en la consola del navegador o crearlo en Firestore → Índices.

Medición de embudo: cada clic en Cotizar/Llamar/WhatsApp/Email/TikTok
y cada lead enviado se registra en la colección `clicks` (solo cuando
Firebase está configurado). Sirve para saber qué canal convierte.

## Avisos (email + push) — variables de entorno en Vercel

|Variable                         |Qué es                                                                                                                                                                                                                                                                |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|`FIREBASE_SERVICE_ACCOUNT`       |JSON completo de la cuenta de servicio (Firebase → Configuración → Cuentas de servicio → Generar clave)                                                                                                                                                               |
|`RESEND_API_KEY`                 |Clave de resend.com (gratis hasta 3,000 correos/mes). Con el remitente por defecto (`onboarding@resend.dev`) Resend solo entrega al correo dueño de la cuenta; para avisar a otro correo hay que verificar el dominio en Resend y cambiar el `from` en `api/notify.js`|
|`CORREO_AVISOS`                  |Correo(s) que reciben los avisos. Varios separados por coma                                                                                                                                                                                                           |
|`CORREO_REMITENTE`               |Opcional. Solo con dominio verificado en Resend, p. ej. `J & Y Jewelry <avisos@tudominio.com>`. Sin esto, Resend solo entrega al correo dueño de la cuenta                                                                                                            |
|`VAPID_PUBLICA` / `VAPID_PRIVADA`|Generar con `npx web-push generate-vapid-keys`. La pública también va en `config.js` → `vapidPublica`                                                                                                                                                                 |
|`DOMINIO`                        |`https://tudominio.com` (para el enlace al panel en el correo)                                                                                                                                                                                                        |

Push: en el panel aparece “Activar avisos” cuando `vapidPublica` está puesta.
En iPhone el panel debe estar agregado a la pantalla de inicio para recibir push.

## Agenda

Horario configurado en `agendar.html` (DEF): lun/mié/vie 8:00–18:30,
mar/jue/sáb 8:00–19:00, citas cada hora de 60 min, anticipación 5 h,
30 días de ventana. Desde el panel se bloquean días completos. Cada
cita entra como **pendiente** hasta que J & Y la confirme por WhatsApp
o llamada (botón en el panel con mensaje listo). Cancelar libera el horario.

## Reseñas

Los clientes las envían desde “Deja tu reseña”; entran ocultas y
se publican desde el panel (pestaña Reseñas), donde también se pueden
editar, agregar/quitar fotos (cliente y pieza) o cargar manualmente
reseñas recibidas por WhatsApp/TikTok. La sección del sitio no aparece
hasta que exista la primera publicada. `index.html?demo=resenas`
muestra 3 ejemplos de diseño, marcados como tal y no publicados.

## Galería editable

Pestaña Galería del panel: agregar fotos (se comprimen en el teléfono),
cambiar texto al pie, reordenar, reemplazar o eliminar. Mientras la
colección `galeria` esté vacía, la página muestra las tres fotos
originales; con la primera foto agregada pasa a usar solo las del panel.

## Panel como app y avisos push

El panel tiene su propio `panel.webmanifest` (display standalone). En
iPhone: Safari → Compartir → “Agregar a pantalla de inicio” → abrir desde
el ícono. La barra de avisos del panel ahora **siempre** dice en qué
estado está (falta instalar, permiso bloqueado, clave ausente, etc.).
Si el panel ya estaba agregado a inicio antes de este cambio, hay que
quitarlo y volverlo a agregar para que tome el manifest nuevo.

## Pendientes (datos no proporcionados)

- Dominio definitivo.
- ~WhatsApp~ CONFIRMADO: botón flotante, CTA en contacto y en el
  fallback del formulario, con mensaje precargado (config.js).
- ~Redes~ TikTok agregado: @romerojesus071 (footer, contacto, schema).
- Reseñas reales: el sistema está completo; la sección se activa
  con la primera reseña publicada desde el panel.
- Método de evaluación de piezas → las respuestas del FAQ son prudentes
  a propósito; se pueden precisar cuando J & Y confirme su proceso.
- Versión en inglés: la arquitectura lo permite (duplicar index como
  `/en/` + hreflang). No se muestran controles de idioma sin contenido.