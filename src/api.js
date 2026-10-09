export const API_URL = 'http://localhost:3000/api';

// API отдаёт страницы; каталог и выбор товара используют весь список.
export async function loadAllProducts(signal) {
    const products = [];
    const limit = 100;
    for (let offset = 0; ; offset += limit) {
        const response = await fetch(`${API_URL}/products?limit=${limit}&offset=${offset}`, { signal });
        if (!response.ok) throw new Error('Ошибка загрузки товаров');
        const page = await response.json();
        products.push(...page);
        if (page.length < limit) return products;
    }
}
