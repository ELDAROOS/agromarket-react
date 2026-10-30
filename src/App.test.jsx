import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { mockFetch, products } from './test/helpers';
describe('Каталог', () => {
  test('показывает загрузку, затем реальные товары', async () => {
    mockFetch(products);
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('Загрузка каталога');
    expect(await screen.findByRole('heading', { name: products[0].name })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: products[1].name })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  test('запрашивает публичный каталог по правильному адресу', async () => {
    const spy = mockFetch(products);
    render(<App />);
    await screen.findByRole('heading', { name: products[0].name });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatch(/\/api\/products\?limit=100&offset=0$/);
    expect(spy.mock.calls[0][1].headers.has('Authorization')).toBe(false);
  });
  test('HTTP 500 виден пользователю, вымышленных товаров нет', async () => {
    mockFetch({ error: 'Внутренняя ошибка сервера' }, 500);
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить каталог');
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });
  test('пустой массив показывает пустой каталог', async () => {
    mockFetch([]);
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Товаров пока нет' })).toBeInTheDocument();
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });
  test('сбой сети показывает понятную ошибку', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Сервер недоступен');
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });
  test('поиск фильтрует товары по вводу пользователя', async () => {
    mockFetch(products);
    render(<App />);
    await screen.findByRole('heading', { name: products[0].name });
    await userEvent.setup().type(screen.getByRole('searchbox'), 'пшеница');
    expect(screen.getByRole('heading', { name: products[1].name })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: products[0].name })).not.toBeInTheDocument();
  });
  test('добавление товара открывает корзину с правильной ценой', async () => {
    mockFetch(products);
    render(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: `Добавить в корзину: ${products[0].name}` }));
    await user.click(screen.getByRole('button', { name: 'Открыть корзину: 1 товаров' }));
    expect(within(screen.getByRole('dialog')).getByText(products[0].name)).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Оформить заявку' })).toBeInTheDocument();
  });
  test('гость не видит админские действия на /admin', async () => {
    window.history.replaceState(null, '', '/admin');
    mockFetch(products);
    render(<App />);
    expect(screen.getByRole('alert')).toHaveTextContent('Нет доступа');
    await screen.findByRole('heading', { name: products[0].name });
    expect(screen.queryByRole('button', { name: /Удалить/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Все оптовые заявки')).not.toBeInTheDocument();
  });
});
