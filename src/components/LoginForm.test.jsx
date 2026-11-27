import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import LoginForm from './LoginForm';
import { server } from '../test/server';
import { renderWithProviders } from '../test/utils';
import { account } from '../test/handlers';

async function fillCredentials(user, password = 'secret123') {
  await user.type(screen.getByLabelText(/email/i), account.email);
  await user.type(screen.getByLabelText(/^пароль/i), password);
}

describe('LoginForm', () => {
  test('поля связаны с подписями и обязательны', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/^пароль/i)).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/^пароль/i)).toBeRequired();
  });
  test('можно ввести email и пароль', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await fillCredentials(user);
    expect(screen.getByLabelText(/email/i)).toHaveValue(account.email);
    expect(screen.getByLabelText(/^пароль/i)).toHaveValue('secret123');
  });
  test('пустая форма не отправляет запрос', async () => {
    const onLogin = vi.fn();
    let requests = 0;
    server.use(http.post('*/api/auth/login', () => { requests++; return HttpResponse.json({}); }));
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onLogin={onLogin} />);
    await user.click(screen.getByRole('button', { name: 'Войти', exact: true }));
    expect(requests).toBe(0);
    expect(onLogin).not.toHaveBeenCalled();
  });
  test('передаёт пользователя и токен после успешного входа', async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onLogin={onLogin} />);
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Войти', exact: true }));
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(account, 'test-token'));
  });
  test('401 показывает ошибку и сохраняет введённый email', async () => {
    const onLogin = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onLogin={onLogin} />);
    await fillCredentials(user, 'wrong');
    await user.click(screen.getByRole('button', { name: 'Войти', exact: true }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный email или пароль');
    expect(screen.getByLabelText(/email/i)).toHaveValue(account.email);
    expect(localStorage.getItem('token')).toBeNull();
    expect(onLogin).not.toHaveBeenCalled();
  });
  test.each([true, false])('429 показывает понятное сообщение (error в ответе: %s)', async (withMessage) => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json(
      withMessage ? { error: 'Слишком много попыток. Попробуйте через 15 минут' } : {}, { status: 429 },
    )));
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Войти', exact: true }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/слишком много попыток/i);
    expect(screen.getByRole('button', { name: 'Войти', exact: true })).toBeEnabled();
  });
  test('пока запрос выполняется, повторная отправка заблокирована', async () => {
    let finish;
    let requests = 0;
    const response = new Promise((resolve) => { finish = resolve; });
    server.use(http.post('*/api/auth/login', async () => {
      requests++;
      await response;
      return HttpResponse.json({ user: account, token: 'test-token' });
    }));
    const user = userEvent.setup();
    const onLogin = vi.fn();
    renderWithProviders(<LoginForm onLogin={onLogin} />);
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Войти', exact: true }));
    try {
      const pending = screen.getByRole('button', { name: 'Подождите…' });
      expect(pending).toBeDisabled();
      await user.click(pending);
      await waitFor(() => expect(requests).toBe(1));
    } finally { finish(); }
    await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));
  });
  test('регистрация показывает details и помечает неверное поле', async () => {
    server.use(http.post('*/api/auth/register', () => HttpResponse.json({
      error: 'Ошибка валидации', details: [{ field: 'email', message: 'Некорректный e-mail' }],
    }, { status: 400 })));
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /создать профиль/i }));
    await user.type(screen.getByLabelText(/ваше имя/i), 'Покупатель');
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться', exact: true }));
    expect(within(await screen.findByRole('alert')).getByText('Некорректный e-mail')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
  });
});
