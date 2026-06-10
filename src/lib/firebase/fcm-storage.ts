const FCM_TOKEN_KEY = 'fcm_device_token'

export function getStoredFcmToken() {
  return localStorage.getItem(FCM_TOKEN_KEY)
}

export function storeFcmToken(token: string) {
  localStorage.setItem(FCM_TOKEN_KEY, token)
}

export function clearFcmToken() {
  localStorage.removeItem(FCM_TOKEN_KEY)
}
