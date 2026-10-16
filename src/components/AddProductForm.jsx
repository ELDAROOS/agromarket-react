import { useState } from 'react';
import { apiFetch } from '../api';

export default function AddProductForm({ onAdded }) {
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setError('');
    setSending(true);
    setSuccess(false);

    try {
      const product = await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({ ...data, price: Number(data.price) }),
      });
      onAdded(product);
      form.reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section style={{ padding: '24px 0' }}>
      <div className="container">
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <span className="badge badge-accent" style={{ marginBottom: '8px' }}>Панель управления</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '16px' }}>
            Добавить новый органический товар
          </h3>

          {error && <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: '16px' }}>{error}</div>}
          {success && <div className="form-alert form-alert-success" role="status" style={{ marginBottom: '16px' }}>✓ Товар успешно опубликован в каталоге!</div>}

          <form className="order-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prod-name">Название продукта *</label>
                <input id="prod-name" name="name" placeholder="Например: Масло льна, 250 мл" required />
              </div>
              <div className="form-group">
                <label htmlFor="prod-cat">Категория</label>
                <input id="prod-cat" name="category" placeholder="Масла / Мёд и пасека / Чай" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prod-price">Цена (₸) *</label>
                <input id="prod-price" name="price" type="number" min="0" max="2147483647" step="1" placeholder="3200" required />
              </div>
              <div className="form-group">
                <label htmlFor="prod-unit">Единица измерения</label>
                <input id="prod-unit" name="unit" defaultValue="шт" placeholder="шт / кг / л" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prod-img">Ссылка на изображение (URL)</label>
              <input id="prod-img" name="image" type="url" placeholder="https://… или /images/honey.jpg" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', minHeight: '46px' }} disabled={sending}>
              {sending ? 'Сохранение…' : '+ Опубликовать товар'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
