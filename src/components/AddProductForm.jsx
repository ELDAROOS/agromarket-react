import { useState } from 'react';
import { apiFetch } from '../api';

export default function AddProductForm({ onAdded, product: initial }) {
  const [error, setError] = useState('');
  const [details, setDetails] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setError('');
    setDetails([]);
    setFieldErrors({});
    setSending(true);
    setSuccess(false);

    try {
      const product = await apiFetch(initial ? `/products/${initial.id}` : '/products', {
        method: initial ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...data, price: Number(data.price), stock: Number(data.stock),
          category: data.category || null, image: data.image || null }),
      });
      onAdded(product);
      form.reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Ошибка при добавлении товара');
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
    <section style={{ padding: '24px 0' }}>
      <div className="container">
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <span className="badge badge-accent" style={{ marginBottom: '8px' }}>Панель управления</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-primary)', marginBottom: '16px' }}>
            {initial ? 'Редактировать товар' : 'Добавить новый органический товар'}
          </h3>

          {error && (
            <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: '16px' }}>
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
          {success && <div className="form-alert form-alert-success" role="status" style={{ marginBottom: '16px' }}>✓ Товар успешно опубликован в каталоге!</div>}

          <form className="order-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prod-name">Название продукта *</label>
                <input
                  id="prod-name"
                  name="name"
                  defaultValue={initial?.name}
                  placeholder="Например: Масло льна, 250 мл"
                  required
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                {fieldErrors.name && (
                  <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                    {fieldErrors.name}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="prod-cat">Категория</label>
                <input
                  id="prod-cat"
                  name="category"
                  defaultValue={initial?.category ?? ''}
                  placeholder="Масла / Мёд и пасека / Чай"
                  aria-invalid={Boolean(fieldErrors.category)}
                />
                {fieldErrors.category && (
                  <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                    {fieldErrors.category}
                  </span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prod-price">Цена (₸) *</label>
                <input
                  id="prod-price"
                  name="price"
                  defaultValue={initial?.price}
                  type="number"
                  min="1"
                  max="10000000"
                  step="1"
                  placeholder="3200"
                  required
                  aria-invalid={Boolean(fieldErrors.price)}
                />
                {fieldErrors.price && (
                  <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                    {fieldErrors.price}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="prod-unit">Единица измерения</label>
                <input
                  id="prod-unit"
                  name="unit"
                  defaultValue={initial?.unit ?? 'кг'}
                  placeholder="шт / кг / л"
                  aria-invalid={Boolean(fieldErrors.unit)}
                />
                {fieldErrors.unit && (
                  <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                    {fieldErrors.unit}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prod-stock">Остаток</label>
              <input id="prod-stock" name="stock" type="number" min="0" max="2147483647"
                step="1" defaultValue={initial?.stock ?? 0} required aria-invalid={Boolean(fieldErrors.stock)} />
              {fieldErrors.stock && <span>{fieldErrors.stock}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="prod-img">Ссылка на изображение (URL)</label>
              <input
                id="prod-img"
                name="image"
                defaultValue={initial?.image ?? ''}
                placeholder="https://… или /images/honey.jpg"
                aria-invalid={Boolean(fieldErrors.image)}
              />
              {fieldErrors.image && (
                <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.image}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', minHeight: '44px', padding: '12px 24px' }}
              disabled={sending}
            >
              {sending ? 'Сохранение…' : initial ? 'Сохранить изменения' : '+ Опубликовать товар'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
