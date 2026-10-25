
"use strict";

// Akilli Garson - Web Push Service Worker

const APP_URL = "/akilli-garson/staff.html";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// Telefon kilitliyken veya sayfa kapaliyken
// gelen Web Push mesajini goster.

self.addEventListener("push", event => {
  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    data = {
      title: "Akıllı Garson",
      body: event.data
        ? event.data.text()
        : "Yeni bir çağrı var."
    };
  }

  const title =
    typeof data.title === "string"
      ? data.title
      : "🔔 Akıllı Garson";

  const body =
    typeof data.body === "string"
      ? data.body
      : "Yeni bir müşteri çağrısı var.";

  const url = new URL(
    APP_URL,
    self.location.origin
  ).href;

  const options = {
    body,
    tag: data.call_id
      ? "waiter-call-" + data.call_id
      : "waiter-new-call",
    renotify: true,
    requireInteraction: false,
    data: {
      url,
      call_id: data.call_id ?? null
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

// Bildirime basildiginda garson
// panelini ac veya acik sekmeye don.

self.addEventListener(
  "notificationclick",
  event => {
    event.notification.close();

    const targetUrl = new URL(
      APP_URL,
      self.location.origin
    ).href;

    event.waitUntil(
      (async () => {
        const windows =
          await self.clients.matchAll({
            type: "window",
            includeUncontrolled: true
          });

        for (const client of windows) {
          const current = new URL(
            client.url
          );

          if (
            current.origin ===
              self.location.origin &&
            current.pathname ===
              APP_URL
          ) {
            if ("focus" in client) {
              return client.focus();
            }
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(
            targetUrl
          );
        }
      })()
    );
  }
);
