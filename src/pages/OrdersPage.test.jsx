import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import App from '../App';
import OrdersPage from './OrdersPage';
import { account } from '../test/handlers';
import { renderWithProviders } from '../test/utils';
import { server } from '../test/server';

const purchase = {
  id: 42, status: 'new', address: 'Астана, ул. Женис, 62', total: 3500,
  items: [{ productId: 1, name: 'Мёд гречишный', quantity: 1, price: 3500 }],
};

test('показывает загрузку, сообщение об оформлении и пустой список', async () => {
  renderWithProviders(<OrdersPage />, { route: '/orders?created=42' });
  expect(screen.getByText('Загрузка заказов…')).toBeInTheDocument();
  expect(screen.getByText('Заказ №42 оформлен')).toBeInTheDocument();
  expect(await screen.findByText(/у вас пока нет заказов/i)).toBeInTheDocument();
});

test('показывает ошибку загрузки заказов', async () => {
  server.use(http.get('*/api/orders/my', () => HttpResponse.json({ error: 'Сервис недоступен' }, { status: 503 })));
  renderWithProviders(<OrdersPage />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Сервис недоступен');
});

test('покупатель отменяет новый заказ и видит обновлённый статус', async () => {
  server.use(
    http.get('*/api/orders/my', () => HttpResponse.json([purchase])),
    http.post('*/api/orders/42/cancel', () => HttpResponse.json({ id: 42, status: 'cancelled' })),
  );
  const user = userEvent.setup();
  renderWithProviders(<OrdersPage />);
  await user.click(await screen.findByRole('button', { name: 'Отменить' }));
  expect(await screen.findByText(/отменён/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Отменить' })).not.toBeInTheDocument();
});

test('фермер видит входящие позиции, а покупатель не видит ссылку', async () => {
  localStorage.setItem('token', 'test-token');
  server.use(
    http.get('*/api/auth/me', () => HttpResponse.json({ ...account, role: 'farmer' })),
    http.get('*/api/orders/incoming', () => HttpResponse.json([{
      orderId: 42, productId: 1, product: 'Гречишный мёд', status: 'new',
      buyerName: 'Алия', address: purchase.address, quantity: 1, price: 3500,
    }])),
  );
  const view = renderWithProviders(<App />, { route: '/orders/incoming' });
  expect(await screen.findByText(/гречишный мёд/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Заказы на мои товары' })).toHaveAttribute('href', '/orders/incoming');
  view.unmount();
  server.use(http.get('*/api/auth/me', () => HttpResponse.json(account)));
  renderWithProviders(<App />, { route: '/orders/incoming' });
  expect(await screen.findByText('Раздел доступен фермерам.')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Заказы на мои товары' })).not.toBeInTheDocument();
});
