import { render, screen } from '@testing-library/react';
import OrdersPanel from './OrdersPanel';
import { mockFetch } from '../test/helpers';
describe('OrdersPanel и JWT', () => {
  test('передаёт Bearer token при загрузке личных заявок', async () => {
    localStorage.setItem('token', 'test-token');
    const spy = mockFetch([{ id: 17, product_name: 'Мёд', quantity: 10, status: 'new' }]);
    render(<OrdersPanel />);
    expect(screen.getByRole('status')).toHaveTextContent('Загрузка');
    expect(await screen.findByText('#17')).toBeInTheDocument();
    expect(spy.mock.calls[0][0]).toMatch(/\/orders\/my$/);
    expect(new Headers(spy.mock.calls[0][1].headers).get('Authorization')).toBe('Bearer test-token');
  });
  test('401 сообщает о завершении сеанса и очищает сессию', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', '{}');
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    mockFetch({ error: 'Войдите заново' }, 401);
    render(<OrdersPanel />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Войдите заново');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'session-expired' }));
  });
});
