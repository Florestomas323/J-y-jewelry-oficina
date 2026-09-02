/* Service worker del panel: recibe las notificaciones push y abre el panel al tocarlas. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function(e){
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch(_) { d = { title:'J & Y Jewelry', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'J & Y Jewelry', {
    body: d.body || '', icon: '/icono-192.png', badge: '/icono-192.png', tag: d.tag || 'jy', data: { url: d.url || '/panel' }
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/panel';
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(lista){
    for (var i=0;i<lista.length;i++){ if (lista[i].url.indexOf('/panel') > -1 && 'focus' in lista[i]) return lista[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
