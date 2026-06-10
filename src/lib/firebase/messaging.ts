import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from 'firebase/messaging'
import {
  getFirebaseConfig,
  getVapidKey,
  isFirebaseConfigured,
  type FirebaseClientConfig,
} from './config'

let firebaseApp: FirebaseApp | null = null
let messaging: Messaging | null = null

function buildServiceWorkerUrl(config: FirebaseClientConfig) {
  const code = `
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification && payload.notification.title ? payload.notification.title : 'إشعار';
  const options = {
    body: payload.notification && payload.notification.body ? payload.notification.body : '',
    icon: '/favicon.svg',
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});
`
  const blob = new Blob([code], { type: 'application/javascript' })
  return URL.createObjectURL(blob)
}

async function getFirebaseMessaging() {
  if (!(await isSupported())) return null
  if (!isFirebaseConfigured()) return null

  const config = getFirebaseConfig()
  const vapidKey = getVapidKey()
  if (!config || !vapidKey) return null

  if (!firebaseApp) {
    firebaseApp = initializeApp(config)
  }

  if (!messaging) {
    messaging = getMessaging(firebaseApp)
  }

  return { messaging, vapidKey, config }
}

export async function requestFcmToken(): Promise<string | null> {
  const ctx = await getFirebaseMessaging()
  if (!ctx) return null

  if (Notification.permission === 'denied') return null

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null
  }

  const swUrl = buildServiceWorkerUrl(ctx.config)
  try {
    const registration = await navigator.serviceWorker.register(swUrl)
    await navigator.serviceWorker.ready

    const token = await getToken(ctx.messaging, {
      vapidKey: ctx.vapidKey,
      serviceWorkerRegistration: registration,
    })

    return token || null
  } finally {
    URL.revokeObjectURL(swUrl)
  }
}

export async function subscribeToForegroundMessages(
  onPayload: (payload: {
    title?: string
    body?: string
    data?: Record<string, string>
  }) => void,
) {
  const ctx = await getFirebaseMessaging()
  if (!ctx) return () => undefined

  return onMessage(ctx.messaging, (payload) => {
    onPayload({
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: payload.data,
    })
  })
}
