import { WheatIcon, CheckIcon } from './Icons';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQty, onRemoveItem, onCheckout }) {
  if (!isOpen) return null;

  const totalSum = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const freeShippingThreshold = 20000;
  const progressPercent = Math.min(100, (totalSum / freeShippingThreshold) * 100);
  const diffToFree = Math.max(0, freeShippingThreshold - totalSum);

  return (
    <div className="cart-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Заголовок шторки */}
        <div className="cart-header">
          <h3>Ваша корзина</h3>
          <button type="button" className="cart-close-btn" onClick={onClose} aria-label="Закрыть корзину">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Прогресс бесплатной доставки */}
        <div className="shipping-bar">
          <div className="shipping-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {diffToFree === 0 ? (
              <>
                <CheckIcon size={15} />
                <span>Бесплатная эко-доставка активна!</span>
              </>
            ) : (
              <span>До бесплатной доставки осталось {diffToFree.toLocaleString('ru-RU')} ₸</span>
            )}
          </div>
          <div className="shipping-progress">
            <div className="shipping-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Список товаров */}
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon" style={{ color: 'var(--color-secondary)' }}>
                <WheatIcon size={44} />
              </span>
              <h4>Корзина пуста</h4>
              <p>Выберите свежие органические продукты в нашем каталоге</p>
            </div>
          ) : (
            cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="cart-item">
                <img
                  src={product.image || '/images/hero.jpg'}
                  alt={product.name}
                  className="cart-item-img"
                  onError={(e) => {
                    e.currentTarget.src = '/images/hero.jpg';
                  }}
                />
                <div className="cart-item-info">
                  <span className="cart-item-title">{product.name}</span>
                  <span className="cart-item-price">{(product.price * quantity).toLocaleString('ru-RU')} ₸</span>
                  <div className="cart-qty-controls">
                    <button type="button" className="qty-btn" onClick={() => onUpdateQty(product.id, -1)} aria-label="Уменьшить">-</button>
                    <span className="qty-val">{quantity}</span>
                    <button type="button" className="qty-btn" onClick={() => onUpdateQty(product.id, 1)} aria-label="Увеличить">+</button>
                    <button
                      type="button"
                      className="card-delete-btn"
                      style={{ marginLeft: 'auto', padding: '2px 8px', minHeight: '32px' }}
                      onClick={() => onRemoveItem(product.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Подвал корзины */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Доставка:</span>
              <span>{diffToFree === 0 ? 'Бесплатно' : 'По тарифу'}</span>
            </div>
            <div className="cart-total-row">
              <span>Итого:</span>
              <span>{totalSum.toLocaleString('ru-RU')} ₸</span>
            </div>
            <button
              type="button"
              className="btn btn-cta"
              style={{ width: '100%' }}
              onClick={() => {
                onClose();
                onCheckout?.();
              }}
            >
              Оформить заявку
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
