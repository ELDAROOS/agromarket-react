import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import { mockFetch } from '../test/helpers';
const account = { id: 1, name: 'Покупатель', role: 'user' };
async function fill(user, email = 'farmer@agromarket.kz') {
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Пароль'), 'secret123');
}
describe('LoginForm', () => {
  test('отправляет email и пароль и передаёт сессию', async () => {
    const spy = mockFetch({ user: account, token: 'new-token' });
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);
    const user = userEvent.setup();
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Войти', exact: true }));
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(account, 'new-token'));
    expect(spy).toHaveBeenCalledTimes(1);
    const [url, options] = spy.mock.calls[0];
    expect(url).toMatch(/\/api\/auth\/login$/);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ email: 'farmer@agromarket.kz', password: 'secret123' });
    expect(options.headers.has('Authorization')).toBe(false);
  });
  test('пустые поля не отправляются и помечаются невалидными', async () => {
    render(<LoginForm onLogin={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Войти', exact: true }));
    expect(screen.getByLabelText('Email')).toBeInvalid();
    expect(screen.getByLabelText('Пароль')).toBeInvalid();
    expect(fetch).not.toHaveBeenCalled();
  });
  test('email без @ не отправляется', async () => {
    render(<LoginForm onLogin={vi.fn()} />);
    const user = userEvent.setup();
    await fill(user, 'invalid-email');
    await user.click(screen.getByRole('button', { name: 'Войти', exact: true }));
    expect(screen.getByLabelText('Email')).toBeInvalid();
    expect(fetch).not.toHaveBeenCalled();
  });
  test('показывает ошибку неверного пароля', async () => {
    mockFetch({ error: 'Неверный email или пароль' }, 401);
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);
    const user = userEvent.setup();
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Войти', exact: true }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный email или пароль');
    expect(onLogin).not.toHaveBeenCalled();
  });
  test('регистрация отправляет имя и создаёт сессию', async () => {
    const spy = mockFetch({ user: account, token: 'registered' }, 201);
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Создать профиль/ }));
    await user.type(screen.getByLabelText('Ваше имя'), 'Покупатель');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(account, 'registered'));
    expect(spy.mock.calls[0][0]).toMatch(/\/auth\/register$/);
    expect(JSON.parse(spy.mock.calls[0][1].body).name).toBe('Покупатель');
  });
});
