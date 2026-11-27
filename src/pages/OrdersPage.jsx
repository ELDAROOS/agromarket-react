import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { money } from '../format';

const statuses = { new: 'Новый', confirmed: 'Подтверждён', shipped: 'Отгружен', cancelled: 'Отменён' };

function BuyerOrder({ order, busy, onCancel }) {
  return (
    <li className="checkout-order">
      <h2>Заказ №{order.id}</h2>
      <p>{statuses[order.status]} · {order.address}</p>
      <ul>
        {order.items.map(({ productId, name, quantity, price }) => (
          <li key={productId}>{name} × {quantity} · {money(price * quantity)}</li>
        ))}
      </ul>
      <p><strong>Итого: {money(order.total)}</strong></p>
      {order.status === 'new' && (
        <button type="button" className="btn btn-secondary" disabled={busy}
          onClick={() => onCancel(order.id)}>Отменить</button>
      )}
    </li>
  );
}

export default function OrdersPage({ incoming = false }) {
  const [params] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const pending = useRef(false);
  const title = incoming ? 'Заказы на мои товары' : 'Мои заказы';
  const created = params.get('created');
  const path = incoming ? '/orders/incoming' : '/orders/my?type=checkout';

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(path, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setOrders(data); })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [path]);

  async function cancel(id) {
    if (pending.current) return;
    pending.current = true;
    setCancelling(id);
    setCancelError('');
    try {
      const result = await apiFetch(`/orders/${id}/cancel`, { method: 'POST' });
      setOrders((current) => current.map((order) =>
        order.id === id ? { ...order, status: result.status } : order));
    } catch (err) {
      setCancelError(err.message);
    } finally {
      pending.current = false;
      setCancelling(null);
    }
  }

  return (
    <main className="container product-details">
      <h1>{title}</h1>
      {!incoming && /^[1-9][0-9]*$/.test(created ?? '') && (
        <p role="status" className="form-alert form-alert-success">Заказ №{created} оформлен</p>
      )}
      {error ? <p role="alert" className="form-alert form-alert-error">{error}</p> : orders === null ? (
        <p role="status">Загрузка заказов…</p>
      ) : orders.length === 0 ? (
        <p>{incoming ? 'На ваши товары пока нет заказов.' : 'У вас пока нет заказов.'} <Link to="/#catalog">В каталог</Link></p>
      ) : (
        <ul className="checkout-orders">
          {orders.map((order) => incoming ? (
            <li className="checkout-order" key={`${order.orderId}-${order.productId}`}>
              <h2>Заказ №{order.orderId}</h2>
              <p>{order.product} × {order.quantity} · {money(order.price * order.quantity)}</p>
              <p>{statuses[order.status]} · {order.buyerName} · {order.address}</p>
            </li>
          ) : <BuyerOrder key={order.id} order={order} busy={cancelling !== null} onCancel={cancel} />)}
        </ul>
      )}
      {cancelError && <p role="alert" className="form-alert form-alert-error">{cancelError}</p>}
    </main>
  );
}
