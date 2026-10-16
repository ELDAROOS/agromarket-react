import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { RefreshIcon, PackageCheckIcon } from './Icons';

const statuses = {
  new: 'Новая',
  processing: 'В работе',
  done: 'Выполнена',
  cancelled: 'Отменена',
};

export default function OrdersPanel({ admin = false, revision = 0 }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(admin ? '/orders' : '/orders/my', { signal: controller.signal })
      .then((data) => {
        setOrders(data);
        setError('');
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [admin, revision, refresh]);

  async function changeStatus(id, status) {
    setSaving(id);
    setError('');
    try {
      const updated = await apiFetch(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setOrders((items) => items.map((order) => (order.id === id ? { ...order, ...updated } : order)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="orders-section">
      <div className="container">
        <div className="orders-container">
          <div className="orders-header">
            <div>
              <span className="badge badge-organic" style={{ marginBottom: '8px' }}>
                {admin ? 'Панель администратора' : 'Личный кабинет'}
              </span>
              <h2>{admin ? 'Все оптовые заявки' : 'История моих заявок'}</h2>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ minHeight: '40px', padding: '0 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              disabled={loading || saving !== null}
              onClick={() => {
                setLoading(true);
                setError('');
                setRefresh((n) => n + 1);
              }}
            >
              <RefreshIcon size={14} />
              <span>Обновить</span>
            </button>
          </div>

          {error && <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: '16px' }}>{error}</div>}

          {loading ? (
            <p style={{ color: 'var(--color-text-muted)', padding: '24px 0' }} role="status">Загрузка данных заявок…</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <PackageCheckIcon size={44} />
              </div>
              <p>У вас пока нет оформленных заявок.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Товар</th>
                    {admin && <th>Контакты клиента</th>}
                    <th>Объём</th>
                    <th>Доставка</th>
                    <th>Комментарий</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td><b>#{order.id}</b></td>
                      <td>{order.product_name || 'Общая заявка'}</td>
                      {admin && (
                        <td>
                          <b>{order.name}</b>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {order.email} • {order.phone}
                          </div>
                        </td>
                      )}
                      <td><b>{order.quantity} кг</b></td>
                      <td>{order.delivery_date || 'По согласованию'}</td>
                      <td>{order.comment || '—'}</td>
                      <td>
                        {admin ? (
                          <select
                            aria-label={`Статус заявки ${order.id}`}
                            value={order.status}
                            disabled={saving !== null}
                            onChange={(e) => changeStatus(order.id, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: '1px solid var(--color-border)',
                              background: '#fff'
                            }}
                          >
                            {Object.entries(statuses).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`status-pill status-${order.status}`}>
                            {statuses[order.status] || order.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
