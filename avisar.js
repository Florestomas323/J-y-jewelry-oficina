/* ============================================================
   AVISAR — enlace entre los formularios y la función de avisos
   ------------------------------------------------------------
   Se llama después de guardar en Firestore. Solo manda la
   colección y el id: el servidor lee el documento real, así
   nadie puede inventarse un aviso. Nunca lanza error.
   ============================================================ */
window.avisar = function (coleccion, id) {
  try {
    if (!coleccion || !id) return;
    var datos = JSON.stringify({ coleccion: coleccion, id: String(id) });
    if (navigator.sendBeacon) {
      if (navigator.sendBeacon('/api/notify', new Blob([datos], { type: 'application/json' }))) return;
    }
    fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: datos, keepalive: true }).catch(function () {});
  } catch (e) {}
};
