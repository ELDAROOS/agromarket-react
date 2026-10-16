import { useState } from 'react';
import { apiFetch } from '../api';

export default function PasswordForm({ onChanged }) {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setError('');
    setMessage('');
    setSending(true);
    try {
      const result = await apiFetch('/auth/password', { method: 'PATCH', body: JSON.stringify(data) });
      onChanged(result.user, result.token);
      form.reset();
      setMessage('Пароль успешно обновлён.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <details style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
      <summary style={{ cursor: 'pointer', fontWeight: '600', color: 'var(--color-primary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Сменить пароль</span>
      </summary>
      <form className="order-form" onSubmit={handleSubmit} style={{ marginTop: '16px', gap: '14px' }}>
        {error && <div className="form-alert form-alert-error" role="alert">{error}</div>}
        {message && <div className="form-alert form-alert-success" role="status">{message}</div>}

        <div className="form-group">
          <label htmlFor="oldPassword">Текущий пароль</label>
          <input id="oldPassword" name="oldPassword" type="password" autoComplete="current-password" required />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Новый пароль (от 8 символов)</label>
          <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength="8" required />
        </div>

        <button type="submit" className="btn btn-secondary" style={{ width: '100%', minHeight: '44px' }} disabled={sending}>
          {sending ? 'Сохранение…' : 'Обновить пароль'}
        </button>
      </form>
    </details>
  );
}
