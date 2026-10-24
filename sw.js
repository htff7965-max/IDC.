// Service worker: بيخلي الواجهة تفتح بدون إنترنت. طلبات Supabase بتعدي دايمًا على الشبكة.
const V = 'idc-v1';
const SHELL = ['./', 'index.html', 'u.html', 'css/app.css', 'js/app.js', 'js/api.js', 'js/auth.js', 'js/config.js',
  'js/i18n.js', 'js/lock.js', 'js/ui.js', 'js/vault.js', 'manifest.webmanifest', 'icons/icon.svg'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('supabase.co')) return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
