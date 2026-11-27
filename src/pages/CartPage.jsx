import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { money } from '../format';
import { quantityLimit, useCart } from '../context/cart';

export default function CartPage({ user, checkingAuth, onOpenAuth }) {
  const { items, adjust, remove, total, clear, updateAvailability } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const pending = useRef(false);
  const exceedsStock = items.some((item) => item.quantity > quantityLimit(item.stock));

  async function submit(event) {
    event.preventDefault();
    if (!user || pending.current || !items.length || exceedsStock) return;
    if (address.trim().length < 5) {
      setError({ message: 'Укажите адрес доставки', details: [] });
      return;
    }
    pending.current = true;
    setSending(true);
    setError(null);
    try {
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          address: address.trim(),
          items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        }),
      });
      clear();
      navigate(`/orders?created=${order.id}`);
    } catch (err) {
      const details = Array.isArray(err.details) ? err.details : [];
      const shortage = details.filter((item) => Number.isInteger(item.available));
      setError({ message: err.message, details });
      if (err.status === 409 && shortage.length) updateAvailability(shortage);
    } finally {
      pending.current = false;
      setSending(false);
    }
  }

  return (
    <main className="container product-details">
      <h1>Корзина</h1>
      {!items.length ? <p>Корзина пуста. <Link to="/#catalog">В каталог</Link></p> : (
        <>
          <ul className="checkout-items">
            {items.map(({ productId, name, price, quantity, stock }) => (
              <li key={productId}>
                <Link to={`/products/${productId}`}>{name}</Link>
                <div className="cart-qty-controls">
                  <button type="button" aria-label={`Уменьшить количество: ${name}`}
                    disabled={sending} onClick={() => adjust(productId, -1)}>−</button>
                  <span>{quantity}</span>
                  <button type="button" aria-label={`Увеличить количество: ${name}`}
                    disabled={sending || quantity >= quantityLimit(stock)} onClick={() => adjust(productId, 1)}>+</button>
                </div>
                <strong>{money(price * quantity)}</strong>
                <button type="button" className="btn btn-secondary" disabled={sending}
                  onClick={() => remove(productId)} aria-label={`Убрать из корзины: ${name}`}>Убрать</button>
              </li>
            ))}
          </ul>
          <p><strong>Итого: {money(total)}</strong></p>
          {error && (
            <div className="form-alert form-alert-error" role="alert">
              <p>{error.message}</p>
              {error.details.length > 0 && <ul>{error.details.map((detail, i) => (
                <li key={detail.productId ?? i}>{detail.available === undefined
                  ? detail.message : `${detail.name}: осталось ${detail.available}`}</li>
              ))}</ul>}
            </div>
          )}
          {exceedsStock && <p>Уменьшите количество или уберите товары, которых не хватает.</p>}
          {checkingAuth ? <p role="status">Проверка авторизации…</p> : user ? (
            <form className="order-form checkout-form" onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="delivery-address">Адрес доставки</label>
                <input id="delivery-address" autoComplete="street-address" value={address}
                  onChange={(event) => setAddress(event.target.value)} minLength={5} maxLength={200}
                  required disabled={sending} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={sending || exceedsStock}>
                {sending ? 'Оформляем…' : 'Оформить заказ'}
              </button>
            </form>
          ) : <p>Для оформления заказа <Link to="/login" onClick={(event) => {
            if (!onOpenAuth) return;
            event.preventDefault();
            onOpenAuth();
          }}>войдите в аккаунт</Link>.</p>}
        </>
      )}
    </main>
  );
}
