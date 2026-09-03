/* ============================================================
   AVISOS — J & Y JEWELRY  (función serverless de Vercel)
   ------------------------------------------------------------
   Cuando entra una solicitud, cita o reseña:
     1. Manda un correo (si hay RESEND_API_KEY y CORREO_AVISOS).
     2. Manda notificación push al panel instalado (si hay
        claves VAPID y dispositivos suscritos).
   Lee el documento real en Firestore; nunca confía en el envío.

   Variables de entorno en Vercel:
     FIREBASE_SERVICE_ACCOUNT  (JSON completo de la cuenta de servicio)
     RESEND_API_KEY, CORREO_AVISOS
     VAPID_PUBLICA, VAPID_PRIVADA
     DOMINIO  (ej. https://jyjewelry.com — para el enlace al panel)
   ============================================================ */
const webpush = require('web-push');
const admin = require('firebase-admin');

const PERMITIDAS = {
  leads:        { titulo: 'Nueva solicitud de evaluación', origen: 'Formulario web' },
  appointments: { titulo: 'Nueva cita pendiente',          origen: 'Agenda' },
  testimonials: { titulo: 'Nueva reseña por revisar',      origen: 'Reseñas' },
};

let listo = false;
function iniciarFirebase() {
  if (listo || admin.apps.length) { listo = true; return; }
  const cred = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!cred) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(cred)) });
  listo = true;
}
function telBonito(t) {
  const d = String(t || '').replace(/\D/g, ''); const n = (d.length === 11 && d[0] === '1') ? d.slice(1) : d;
  return n.length === 10 ? `(${n.slice(0,3)}) ${n.slice(3,6)}-${n.slice(6)}` : d;
}
function resumen(col, d) {
  const p = [];
  if (d.nombre) p.push(d.nombre);
  if (d.telefono) p.push(telBonito(d.telefono));
  if (col === 'appointments') {
    if (d.fecha) p.push(d.fecha + (d.hora ? ' ' + d.hora : ''));
    if (d.direccion) p.push(d.direccion + (d.ciudad ? ', ' + d.ciudad : '') + (d.zip ? ' ' + d.zip : ''));
  } else if (d.ciudad) p.push(d.ciudad);
  if (d.metal) p.push(d.metal);
  if (col === 'testimonials') { if (d.estrellas) p.push(d.estrellas + '★'); if (d.texto) p.push('"' + String(d.texto).slice(0, 120) + '"'); }
  if (d.mensaje) p.push(String(d.mensaje).slice(0, 120));
  if (d.notas) p.push(String(d.notas).slice(0, 120));
  return p.filter(Boolean).join(' · ') || 'Sin detalles';
}
function urlPanel() { return (process.env.DOMINIO || 'https://j-y-jewelry-oficina.vercel.app').replace(/\/$/, '') + '/panel'; }

async function mandarCorreo(info, texto) {
  const key = process.env.RESEND_API_KEY, para = process.env.CORREO_AVISOS;
  if (!key || !para) return 'sin configurar';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'J & Y Jewelry <onboarding@resend.dev>',
      to: [para],
      subject: info.titulo + ' — ' + info.origen,
      text: info.titulo + '\n' + info.origen + '\n\n' + texto + '\n\nAbrir el panel: ' + urlPanel(),
    }),
  });
  if (r.ok) return 'enviado';
  let det = ''; try { det = (await r.text()).slice(0, 200); } catch (_) {}
  return 'fallo ' + r.status + ' ' + det;
}

async function mandarPush(info, texto) {
  const pub = (process.env.VAPID_PUBLICA || '').trim(), priv = (process.env.VAPID_PRIVADA || '').trim();
  if (!pub || !priv) return 'sin configurar';
  try { webpush.setVapidDetails('mailto:' + (process.env.CORREO_AVISOS || 'admin@sudominio.com').trim(), pub, priv); }
  catch (e) { return 'claves VAPID inválidas: ' + e.message; }
  const subs = await admin.firestore().collection('pushSubs').get();
  if (subs.empty) return 'sin dispositivos';
  let ok = 0, muertas = 0;
  await Promise.all(subs.docs.map(async (doc) => {
    const s = doc.data();
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: info.titulo, body: texto, url: '/panel', tag: info.origen }));
      ok++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) { await doc.ref.delete().catch(() => {}); muertas++; }
    }
  }));
  return ok + ' enviadas de ' + subs.size + (muertas ? ', ' + muertas + ' caducadas borradas' : '');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Diagnóstico: abrir /api/notify en el navegador dice qué falta configurar.
  // Nunca muestra el valor de las variables, solo si están puestas.
  if (req.method === 'GET') {
    const hay = (v) => Boolean(process.env[v] && String(process.env[v]).trim());
    const estado = {
      FIREBASE_SERVICE_ACCOUNT: hay('FIREBASE_SERVICE_ACCOUNT'),
      RESEND_API_KEY: hay('RESEND_API_KEY'),
      CORREO_AVISOS: hay('CORREO_AVISOS'),
      VAPID_PUBLICA: hay('VAPID_PUBLICA'),
      VAPID_PRIVADA: hay('VAPID_PRIVADA'),
      DOMINIO: hay('DOMINIO'),
    };
    let firebase = 'no probado', dispositivos = 'no probado';
    if (estado.FIREBASE_SERVICE_ACCOUNT) {
      try {
        iniciarFirebase();
        const s = await admin.firestore().collection('pushSubs').get();
        firebase = 'conectado';
        dispositivos = s.size + ' dispositivo(s) con avisos activados';
      } catch (e) { firebase = 'ERROR: ' + e.message; }
    } else {
      firebase = 'falta FIREBASE_SERVICE_ACCOUNT';
    }
    const faltan = Object.keys(estado).filter((k) => !estado[k]);

    // Prueba directa: /api/notify?probar=push&clave=XXXXXX  (XXXXXX = últimos 6
    // caracteres de VAPID_PRIVADA). Manda una push de prueba a todos los
    // dispositivos suscritos y devuelve el resultado exacto de cada uno.
    const q = req.query || {};
    const claveOk = q.clave && (process.env.VAPID_PRIVADA || '').trim().slice(-6) === String(q.clave);
    if (q.probar && !claveOk) return res.status(403).json({ ok: false, error: 'clave incorrecta' });
    if (q.probar === 'push' && claveOk) {
      const info = { titulo: 'Prueba de avisos', origen: 'Panel J & Y' };
      const detalle = [];
      try {
        webpush.setVapidDetails('mailto:' + (process.env.CORREO_AVISOS || 'admin@sudominio.com').trim(), process.env.VAPID_PUBLICA.trim(), process.env.VAPID_PRIVADA.trim());
        const subs = await admin.firestore().collection('pushSubs').get();
        for (const d of subs.docs) {
          const sdata = d.data();
          try {
            await webpush.sendNotification({ endpoint: sdata.endpoint, keys: { p256dh: sdata.p256dh, auth: sdata.auth } },
              JSON.stringify({ title: info.titulo, body: 'Si ves esto, las notificaciones funcionan.', url: '/panel', tag: 'prueba' }));
            detalle.push({ dispositivo: (sdata.ua || '').slice(0, 60), resultado: 'enviada' });
          } catch (e) {
            detalle.push({ dispositivo: (sdata.ua || '').slice(0, 60), resultado: 'ERROR ' + (e.statusCode || '') + ' ' + (e.body || e.message || '').toString().slice(0, 200) });
          }
        }
        return res.status(200).json({ prueba: 'push', dispositivos: subs.size, detalle: detalle.length ? detalle : 'ningún dispositivo suscrito: activa los avisos desde el panel' });
      } catch (e) { return res.status(200).json({ prueba: 'push', error: e.message }); }
    }
    if (q.probar === 'correo' && claveOk) {
      const r = await mandarCorreo({ titulo: 'Prueba de avisos', origen: 'Panel J & Y' }, 'Si ves esto, los correos funcionan.').catch((e) => 'error: ' + e.message);
      return res.status(200).json({ prueba: 'correo', resultado: r });
    }

    return res.status(200).json({
      variables: estado,
      faltan: faltan.length ? faltan : 'ninguna',
      firebase,
      dispositivos,
      correo: estado.RESEND_API_KEY && estado.CORREO_AVISOS ? 'configurado' : 'falta configurar',
      push: estado.VAPID_PUBLICA && estado.VAPID_PRIVADA ? 'configurado' : 'falta configurar',
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  try {
    const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { coleccion, id } = cuerpo;
    const info = PERMITIDAS[coleccion];
    if (!info || !id) return res.status(400).json({ ok: false, error: 'petición inválida' });
    iniciarFirebase();
    const snap = await admin.firestore().collection(coleccion).doc(String(id)).get();
    if (!snap.exists) return res.status(404).json({ ok: false, error: 'no existe' });
    const texto = resumen(coleccion, snap.data());
    const [correo, push] = await Promise.all([
      mandarCorreo(info, texto).catch((e) => 'error: ' + e.message),
      mandarPush(info, texto).catch((e) => 'error: ' + e.message),
    ]);
    console.log('[aviso]', coleccion, '| correo:', correo, '| push:', push);
    return res.status(200).json({ ok: true, correo, push });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message });
  }
};
