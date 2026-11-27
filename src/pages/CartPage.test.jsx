import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import CartPage from './CartPage';
import { account } from '../test/handlers';
import { renderWithProviders } from '../test/utils';
import { server } from '../test/server';

const cart = [
  { productId: 1, name: 'Мёд гречишный', price: 3500, quantity: 2, stock: 3 },
  { productId: 2, name: 'Картофель молодой', price: 250, quantity: 1, stock: 10 },
];
const address = 'Астана, ул. Женис, 62';

function renderCart({ items = cart, user = account } = {}) {
  localStorage.setItem('cart', JSON.stringify(items));
  if (user) localStorage.setItem('token', 'test-token');
  renderWithProviders(<Routes>
    <Route path="/cart" element={<CartPage user={user} />} />
    <Route path="/orders" element={<h1>Мои заказы</h1>} />
  </Routes>, { route: '/cart' });
}

const submitButton = () => screen.getByRole('button', { name: 'Оформить заказ' });
async function checkout() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Адрес доставки'), address);
  await user.click(submitButton());
}

test('пустая корзина показывает ссылку в каталог', () => {
  renderCart({ items: [] });
  expect(screen.getByText(/корзина пуста/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'В каталог' })).toHaveAttribute('href', '/#catalog');
});

test('показывает позиции и итог', () => {
  renderCart();
  expect(screen.getByText('Мёд гречишный')).toBeInTheDocument();
  expect(screen.getByText('Картофель молодой')).toBeInTheDocument();
  expect(screen.getByText(/Итого: 7\s250 ₸/)).toBeInTheDocument();
});

test('плюс и минус меняют количество и пересчитывают итог', async () => {
  const user = userEvent.setup();
  renderCart();
  await user.click(screen.getByRole('button', { name: 'Увеличить количество: Мёд гречишный' }));
  expect(screen.getByText(/Итого: 10\s750 ₸/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Увеличить количество: Мёд гречишный' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Уменьшить количество: Картофель молодой' }));
  expect(screen.queryByText('Картофель молодой')).not.toBeInTheDocument();
  expect(screen.getByText(/Итого: 10\s500 ₸/)).toBeInTheDocument();
});

test('успешный заказ отправляет количества без цен, очищает корзину и открывает заказы', async () => {
  let submitted, authorization;
  server.use(http.post('*/api/orders', async ({ request }) => {
    submitted = await request.json();
    authorization = request.headers.get('Authorization');
    return HttpResponse.json({ id: 42 }, { status: 201 });
  }));
  renderCart();
  await checkout();
  expect(await screen.findByRole('heading', { name: 'Мои заказы' })).toBeInTheDocument();
  expect(submitted).toEqual({ address, items: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }] });
  expect(authorization).toBe('Bearer test-token');
  expect(JSON.parse(localStorage.getItem('cart'))).toEqual([]);
});

test('при 409 показывает доступный остаток и сохраняет корзину для исправления', async () => {
  server.use(http.post('*/api/orders', () => HttpResponse.json({
    error: 'Недостаточно товара',
    details: [{ productId: 1, name: 'Мёд гречишный', available: 1 }],
  }, { status: 409 })));
  renderCart();
  await checkout();
  expect(await screen.findByRole('alert')).toHaveTextContent('Мёд гречишный: осталось 1');
  expect(JSON.parse(localStorage.getItem('cart'))[0]).toMatchObject({ quantity: 2, stock: 1 });
  expect(submitButton()).toBeDisabled();
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Уменьшить количество: Мёд гречишный' }));
  expect(submitButton()).toBeEnabled();
});

test('во время отправки кнопка заблокирована', async () => {
  let finish;
  const response = new Promise((resolve) => { finish = resolve; });
  server.use(http.post('*/api/orders', () => response));
  renderCart();
  try {
    await checkout();
    expect(screen.getByRole('button', { name: 'Оформляем…' })).toBeDisabled();
  } finally {
    finish(HttpResponse.json({ error: 'Сеть недоступна' }, { status: 503 }));
  }
  expect(await screen.findByRole('alert')).toHaveTextContent('Сеть недоступна');
});

test('гость видит ссылку на вход вместо оформления', () => {
  renderCart({ user: null });
  expect(screen.getByRole('link', { name: 'войдите в аккаунт' })).toHaveAttribute('href', '/login');
  expect(screen.queryByRole('button', { name: 'Оформить заказ' })).not.toBeInTheDocument();
});
