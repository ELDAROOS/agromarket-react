import { useRef, useState } from 'react';
import { apiFetch } from '../api';
import { SproutIcon, TruckIcon, ShieldCheckIcon, RecycleIcon } from './Icons';

function ContactForm({ products = [], productsLoading = false, productsError = null, onCreated }) {
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inFlight = useRef(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (inFlight.current) return;

    setSuccessMessage('');
    setErrorMessage('');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    inFlight.current = true;
    setSending(true);

    try {
      const result = await apiFetch('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      setSuccessMessage(`Заявка №${result.id} успешно принята! Мы свяжемся с вами в течение 30 минут.`);
      form.reset();
      onCreated?.(result);
    } catch (err) {
      setErrorMessage(err.message || 'Ошибка отправки заявки');
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  }

  return (
    <section id="contact" className="order-section">
      <div className="container">
        <div className="order-card">
          {/* Левая информационная сторона */}
          <div className="order-info-side">
            <div>
              <span className="badge badge-organic" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', marginBottom: '16px' }}>
                <SproutIcon size={12} />
                <span>Прямые эко-поставки</span>
              </span>
              <h2>Оптовые заказы и корпоративные корзины</h2>
              <p style={{ marginTop: '12px' }}>
                Поставляем сертифицированные органические продукты напрямую в кофейни, рестораны, офисы и частные хозяйства.
              </p>
            </div>

            <div className="order-perks">
              <div className="perk-item">
                <span style={{ color: '#a3d9b1' }}><SproutIcon size={18} /></span>
                <span>Минимальный объём заказа — от 10 кг</span>
              </div>
              <div className="perk-item">
                <span style={{ color: '#a3d9b1' }}><TruckIcon size={18} /></span>
                <span>Доставка по Астане и Акмолинской области</span>
              </div>
              <div className="perk-item">
                <span style={{ color: '#a3d9b1' }}><ShieldCheckIcon size={18} /></span>
                <span>Полный комплект фитосанитарных сертификатов</span>
              </div>
              <div className="perk-item">
                <span style={{ color: '#a3d9b1' }}><RecycleIcon size={18} /></span>
                <span>Программа возврата стеклянной и крафтовой тары</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Отдел заботы: +7 (7172) 00-00-00 • info@agromarket.kz
            </div>
          </div>

          {/* Правая форма заказа */}
          <div className="order-form-side">
            <form className="order-form" onSubmit={handleSubmit}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-primary)' }}>
                Оформить заявку
              </h3>

              {successMessage && (
                <div className="form-alert form-alert-success" role="status">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="form-alert form-alert-error" role="alert">
                  {errorMessage}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="product_id">Выбор товара (опционально)</label>
                <select id="product_id" name="product_id" defaultValue="" disabled={productsLoading}>
                  <option value="">
                    {productsLoading ? 'Загрузка каталога…' : 'Общая сборная заявка'}
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {product.price} ₸
                    </option>
                  ))}
                </select>
                {productsError && (
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Список товаров временно недоступен. Вы можете отправить общую заявку.
                  </p>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Ваше имя / Компания *</label>
                  <input id="name" name="name" type="text" placeholder="Алибек / Эко-Кафе" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" placeholder="contact@domain.kz" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Контактный телефон *</label>
                  <input id="phone" name="phone" type="tel" placeholder="+7 7XX XXX XX XX" required />
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Объём заказа (кг) *</label>
                  <input id="quantity" name="quantity" type="number" min="10" defaultValue="10" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="date">Желаемая дата доставки</label>
                <input id="date" name="date" type="date" />
              </div>

              <div className="form-group">
                <label htmlFor="comment">Комментарий к заказу</label>
                <textarea id="comment" name="comment" rows="3" placeholder="Укажите особые пожелания к упаковке или времени доставки" />
              </div>

              <button
                type="submit"
                className="btn btn-cta"
                disabled={sending}
                aria-busy={sending}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {sending ? 'Отправка заявки…' : 'Отправить заявку'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
