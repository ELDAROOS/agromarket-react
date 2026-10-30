import { useState } from 'react';
import { apiFetch } from '../api';

export default function LoginForm({ onLogin, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const isLogin = mode === 'login';

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;
    setError('');
    setSending(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await apiFetch(`/auth/${mode}`, {
        method: 'POST',
        auth: false,
        body: JSON.stringify(data),
      });
      onLogin(result.user, result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="order-form" onSubmit={handleSubmit} aria-label={isLogin ? 'Вход в аккаунт' : 'Регистрация аккаунта'}>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '8px' }}>
        {isLogin ? 'Вход в личный кабинет' : 'Регистрация покупателя'}
      </h3>

      {error && <div className="form-alert form-alert-error" role="alert">{error}</div>}

      {!isLogin && (
        <div className="form-group">
          <label htmlFor="reg-name">Ваше имя</label>
          <input id="reg-name" name="name" autoComplete="name" placeholder="Данияр" required />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input id="login-email" name="email" type="email" autoComplete="username" placeholder="user@domain.kz" required />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Пароль</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          minLength={isLogin ? undefined : 8}
          placeholder="••••••••"
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
          {sending ? 'Подождите…' : isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>

        <button
          type="button"
          className="btn btn-subtle"
          style={{ width: '100%', fontSize: '13px' }}
          disabled={sending}
          onClick={() => {
            setMode(isLogin ? 'register' : 'login');
            setError('');
          }}
        >
          {isLogin ? 'Нет аккаунта? Создать профиль' : 'Уже зарегистрированы? Войти'}
        </button>
      </div>
    </form>
  );
}
