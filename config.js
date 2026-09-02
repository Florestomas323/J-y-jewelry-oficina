/* ============================================================
   CONFIGURACIÓN — OFICINA DIGITAL J & Y JEWELRY
   ------------------------------------------------------------
   Único archivo de datos del negocio. El resto del sitio lee
   de aquí. Para cambiar teléfono, email, dominio o Firebase,
   edita solo este archivo.
   ============================================================ */

window.NEGOCIO = {

  /* ---------- Identidad ---------- */
  nombre:      "J & Y Jewelry",
  nombreLegal: "J & Y Jewelry LLC",
  lema:        "Tu oro al mejor precio en Texas",
  zona:        "Dallas, Texas y alrededores",
  horario:     "Lunes a sábado · Únicamente por cita previa",

  /* Teléfono solo dígitos, formato internacional.
     NO se generan enlaces de WhatsApp: no está confirmado que
     este número tenga WhatsApp. Si el negocio lo confirma,
     cambiar whatsappConfirmado a true. */
  telefono:            "12148935824",

  /* WhatsApp CONFIRMADO por el cliente en este mismo número. */
  whatsappConfirmado:  true,
  whatsappMensaje:     "Hola J & Y Jewelry, quiero cotizar mis piezas de oro o plata.",

  email:   "cubaromero88@hotmail.com",

  /* Dominio propio, sin barra final. Cambiar al publicar. */
  dominio: "https://SUDOMINIO.com",

  /* ---------- Proyecto de Firebase propio ----------
     Proyecto NUEVO e independiente, exclusivo de J & Y.
     No reutilizar ningún proyecto de otra oficina digital.
     Copiar de: Firebase → Configuración del proyecto → Tus apps.
     Mientras queden los valores PEGAR-*, el formulario ofrece
     llamada y email como alternativa y no intenta guardar. */
  firebase: {
    apiKey:            "PEGAR-API-KEY",
    authDomain:        "jy-jewelry.firebaseapp.com",
    projectId:         "PEGAR-PROJECT-ID",
    storageBucket:     "jy-jewelry.firebasestorage.app",
    messagingSenderId: "000000000000",
    appId:             "PEGAR-APP-ID"
  }
};

/* ============================================================
   A partir de aquí no hace falta cambiar nada.
   ============================================================ */
(function(){
  var N = window.NEGOCIO;
  if(!N) return;

  var tel = String(N.telefono || "").replace(/\D/g, "");
  N.tel = tel;

  /* Formato legible: (214) 893-5824 */
  N.telBonito = (function(){
    var d = (tel.length === 11 && tel[0] === "1") ? tel.slice(1) : tel;
    if(d.length === 10) return "(" + d.slice(0,3) + ") " + d.slice(3,6) + "-" + d.slice(6);
    return "+" + tel;
  })();

  /* Enlace directo de WhatsApp con mensaje precargado */
  N.wa = "https://wa.me/" + tel + (N.whatsappMensaje
    ? "?text=" + encodeURIComponent(N.whatsappMensaje) : "");

  /* ¿Firebase está configurado de verdad? */
  N.firebaseListo = !!(N.firebase &&
    N.firebase.apiKey && N.firebase.apiKey.indexOf("PEGAR") === -1 &&
    N.firebase.projectId && N.firebase.projectId.indexOf("PEGAR") === -1);

  /* Aplica teléfono y email a todos los enlaces del sitio. */
  function aplicar(){
    try{
      document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
        a.href = "tel:+" + tel;
      });
      document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){
        a.href = "mailto:" + N.email;
      });
      document.querySelectorAll("[data-tel-bonito]").forEach(function(el){
        el.textContent = N.telBonito;
      });
      document.querySelectorAll("[data-email]").forEach(function(el){
        el.textContent = N.email;
      });
      if(N.whatsappConfirmado){
        document.querySelectorAll("a[data-ws]").forEach(function(a){ a.href = N.wa; });
      }else{
        document.querySelectorAll("[data-ws]").forEach(function(a){ a.style.display = "none"; });
      }
    }catch(e){}
  }
  if(document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", aplicar);
  else
    aplicar();
})();
