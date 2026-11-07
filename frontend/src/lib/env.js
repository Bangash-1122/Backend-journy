export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'VideoHub',
  uploadMaxMb: Number(import.meta.env.VITE_UPLOAD_MAX_MB || 500),
  enableMock: String(import.meta.env.VITE_ENABLE_MOCK) === 'true',
};
