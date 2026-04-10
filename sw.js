// GUARDIAN SOS — Service Worker v1
// Handles push notifications and offline caching

const CACHE = ‘guardian-v1’;
const VAPID_PUBLIC_KEY = ‘BD3vKEZhhb2vLx_e3OvBWtgtBnm_Hs-fgbO5U-uK-HdiGY9MW8zZmmvujmb69RjVQSz8RFDyettokIHph7ol7DQ’;

// ── Install ──
self.addEventListener(‘install’, e => {
console.log(’[SW] Installing…’);
self.skipWaiting();
});

self.addEventListener(‘activate’, e => {
console.log(’[SW] Activated’);
e.waitUntil(clients.claim());
});

// ── Push notifications ──
self.addEventListener(‘push’, e => {
console.log(’[SW] Push received:’, e.data?.text());

let data = {};
try { data = e.data?.json() || {}; } catch { data = { title: ‘GUARDIAN SOS’, body: e.data?.text() }; }

const title = data.title || ‘🚨 EMERGENCIA’;
const options = {
body: data.body || ‘Alguien activó SOS’,
icon: data.icon || ‘/Guardian/icon.png’,
badge: ‘/Guardian/icon.png’,
vibrate: [500, 200, 500, 200, 500],
requireInteraction: true,  // stays on screen until tapped
tag: ‘guardian-sos’,       // replaces previous notification
renotify: true,
data: {
url: data.url || ‘/Guardian/’,
uid: data.uid || ‘’
},
actions: [
{ action: ‘view-map’, title: ‘🗺 Ver mapa’ },
{ action: ‘dismiss’, title: ‘Cerrar’ }
]
};

e.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click ──
self.addEventListener(‘notificationclick’, e => {
e.notification.close();

const action = e.action;
const data = e.notification.data || {};
let url = data.url || ‘/Guardian/’;

if (action === ‘view-map’ && data.uid) {
url = `https://juanmdelaconcha-bot.github.io/Guardian/mapa-vivo.html?uid=${data.uid}`;
}

e.waitUntil(
clients.matchAll({ type: ‘window’, includeUncontrolled: true }).then(cls => {
// Focus existing window if open
for (const c of cls) {
if (c.url === url && ‘focus’ in c) return c.focus();
}
// Open new window
if (clients.openWindow) return clients.openWindow(url);
})
);
});

// ── Background sync (keep alive) ──
self.addEventListener(‘sync’, e => {
if (e.tag === ‘guardian-sync’) {
console.log(’[SW] Background sync’);
}
});
