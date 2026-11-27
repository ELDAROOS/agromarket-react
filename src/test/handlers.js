import { http, HttpResponse } from 'msw';

export const products = [
  { id: 1, name: 'Мёд гречишный', price: 3500, stock: 10, category: 'Мёд и пасека', unit: 'кг' },
  { id: 2, name: 'Картофель молодой', price: 250, stock: 20, category: 'Овощи', unit: 'кг' },
];
export const account = { id: 1, name: 'Тестовый покупатель', email: 'buyer@test.kz', role: 'user' };
export const handlers = [
  http.get('*/api/products', () => HttpResponse.json(products)),
  http.get('*/api/products/:id', ({ params }) => {
    const product = products.find((item) => item.id === Number(params.id));
    return product ? HttpResponse.json(product) : HttpResponse.json({ error: 'Товар не найден' }, { status: 404 });
  }),
  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    return email === account.email && password === 'secret123'
      ? HttpResponse.json({ user: account, token: 'test-token' })
      : HttpResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
  }),
  http.get('*/api/auth/me', () => HttpResponse.json(account)),
  http.get('*/api/orders/my', () => HttpResponse.json([])),
  http.get('*/api/orders', () => HttpResponse.json([])),
];
