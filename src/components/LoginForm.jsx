import { useState } from 'react';
import { apiFetch } from '../api';

export default function LoginForm({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [details, setDetails] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [sending, setSending] = useState(false);
  const isLogin = mode === 'login';

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;
    setError('');
    setDetails([]);
    setFieldErrors({});
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
      setError(err.message || (err.status === 429 ? 'Слишком много попыток. Попробуйте через 15 минут' : 'Произошла ошибка при отправке'));
      if (Array.isArray(err.details) && err.details.length > 0) {
        setDetails(err.details);
        const mapped = {};
        for (const item of err.details) {
          if (item.field) mapped[item.field] = item.message;
        }
        setFieldErrors(mapped);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="order-form" onSubmit={handleSubmit} aria-label={isLogin ? 'Вход в аккаунт' : 'Регистрация аккаунта'}>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '8px' }}>
        {isLogin ? 'Вход в личный кабинет' : 'Регистрация покупателя'}
      </h3>

      {error && (
        <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: '14px' }}>
          <div>{error}</div>
          {details.length > 0 && (
            <ul style={{ margin: '6px 0 0 18px', padding: 0, fontSize: '13px' }}>
              {details.map((d, i) => (
                <li key={i}>{d.message || `${d.field}: ошибка`}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!isLogin && (
        <div className="form-group">
          <label htmlFor="reg-name">Ваше имя</label>
          <input
            id="reg-name"
            name="name"
            autoComplete="name"
            placeholder="Данияр"
            required
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name && (
            <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
              {fieldErrors.name}
            </span>
          )}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="user@domain.kz"
          required
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email && (
          <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
            {fieldErrors.email}
          </span>
        )}
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
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password && (
          <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
            {fieldErrors.password}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', minHeight: '44px' }}
          disabled={sending}
        >
          {sending ? 'Подождите…' : isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>

        <button
          type="button"
          className="btn btn-subtle"
          style={{ width: '100%', fontSize: '13px', minHeight: '44px' }}
          disabled={sending}
          onClick={() => {
            setMode(isLogin ? 'register' : 'login');
            setError('');
            setDetails([]);
            setFieldErrors({});
          }}
        >
          {isLogin ? 'Нет аккаунта? Создать профиль' : 'Уже зарегистрированы? Войти'}
        </button>
      </div>
    </form>
  );
}
