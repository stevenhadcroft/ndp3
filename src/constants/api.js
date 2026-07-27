// In dev, requests to /php/* are proxied through CRA's dev server to the
// host configured in package.json ("proxy"), so they look same-origin to the
// browser and CORS never engages. In prod the /php/ path is served by the
// same origin as the app.

// export const API_URL = '/php/';
export const API_URL = 'https://ndp3.hadcroft.com/php/';