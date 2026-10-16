// Адрес API — из переменной окружения Vite.
// Локально берётся из .env.development, на хостинге (ЛР9) — из настроек сборки
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';


export function saveSession(user, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}
export function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
export async function apiFetch(path, options = {}) {
    const { auth = true, ...fetchOptions } = options;
    const token = auth ? localStorage.getItem('token') : null;
    const headers = new Headers(fetchOptions.headers);
    if (fetchOptions.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('Сервер недоступен. Попробуйте ещё раз.');
    }
    const data = response.status === 204 ? null : await response.json();
    if (response.status === 401 && token && localStorage.getItem('token') === token) {
        clearSession();
        window.dispatchEvent(new Event('session-expired'));
    }
    if (!response.ok) {
        const error = new Error(data?.error || `Ошибка ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return data;
}

// Каталог открыт для всех; получаем все страницы API.
export async function loadAllProducts(signal) {
    const products = [];
    const limit = 100;
    for (let offset = 0; ; offset += limit) {
        const page = await apiFetch(`/products?limit=${limit}&offset=${offset}`, { signal, auth: false });
        products.push(...page);
        if (page.length < limit) return products;
    }
}
