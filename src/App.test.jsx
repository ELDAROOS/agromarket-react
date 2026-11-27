import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import App from './App';
import { server } from './test/server';
import { renderWithProviders } from './test/utils';
import { account } from './test/handlers';

describe('Каталог и сессия', () => {
  test('показывает товары API', async () => {
    renderWithProviders(<App />);
    expect(await screen.findByRole('heading', { name: 'Мёд гречишный' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Картофель молодой' })).toBeInTheDocument();
  });
  test('показывает загрузку до ответа API', async () => {
    server.use(http.get('*/api/products', async () => { await delay(100); return HttpResponse.json([]); }));
    renderWithProviders(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('Загрузка каталога…');
    expect(await screen.findByRole('heading', { name: 'Товары не найдены' })).toBeInTheDocument();
    expect(screen.queryByText('Загрузка каталога…')).not.toBeInTheDocument();
  });
  test('пустой ответ не подменяется демонстрационными товарами', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json([])));
    renderWithProviders(<App />);
    expect(await screen.findByRole('heading', { name: 'Товары не найдены' })).toBeInTheDocument();
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });
  test('500 показывает ошибку без вымышленных товаров', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json({ error: 'Не удалось загрузить каталог' }, { status: 500 })));
    renderWithProviders(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить каталог');
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });
  test('ошибка сети объясняет недоступность сервера', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.error()));
    renderWithProviders(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Сервер недоступен');
  });
  test('поиск без совпадений показывает пустое состояние', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    await screen.findByRole('heading', { name: 'Мёд гречишный' });
    await user.type(screen.getByRole('searchbox'), 'несуществующий товар');
    expect(screen.getByRole('heading', { name: 'Товары не найдены' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Мёд гречишный' })).not.toBeInTheDocument();
  });
  test('успешный вход сохраняет сессию и имя в шапке', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    await user.click(screen.getByRole('button', { name: 'Войти в аккаунт' }));
    const form = within(screen.getByRole('form', { name: 'Вход в аккаунт' }));
    await user.type(form.getByLabelText(/^email/i), account.email);
    await user.type(form.getByLabelText(/^пароль/i), 'secret123');
    await user.click(form.getByRole('button', { name: 'Войти', exact: true }));
    expect(await screen.findByRole('button', { name: `Профиль ${account.name}` })).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(account);
    await screen.findByText('У вас пока нет оформленных заявок.');
  });
  test('401 на восстановлении сессии удаляет устаревший токен', async () => {
    localStorage.setItem('token', 'expired-token');
    server.use(http.get('*/api/auth/me', () => HttpResponse.json({ error: 'Сеанс истёк' }, { status: 401 })));
    const user = userEvent.setup();
    renderWithProviders(<App />);
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Войти в аккаунт' }));
    expect(await screen.findByText('Сеанс истёк')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Вход в аккаунт' })).toBeInTheDocument();
  });
});
