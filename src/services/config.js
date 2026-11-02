export const API_BASE_URL = import.meta.env.PROD
    ? 'https://prisma-research-app.onrender.com'
    : (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:3000'
        : 'http://localhost:3000');
