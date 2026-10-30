import { useState } from 'react';
import { SproutIcon, RecycleIcon, StarIcon, CheckIcon } from './Icons';

function ProductCard({ product, onAdd, featured = false, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [addedAnim, setAddedAnim] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setError('');
    try {
      await onDelete(product);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function handleAddToCart() {
    // ЛР10: намеренно удалён onAdd для демонстрации блокировки CI.
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 900);
  }

  // Определяем подходящий бейдж для разнообразия каталога
  const isZeroWaste = String(product.id) === '2' || product.category === 'Масла';
  const isBio = !isZeroWaste;

  return (
    <article className="card" data-testid="product-card">
      <div className="card-media-wrapper">
        <div className="card-badges">
          {featured && (
            <span className="badge badge-accent">
              <StarIcon size={12} />
              <span>Выбор недели</span>
            </span>
          )}
          {isBio && (
            <span className="badge badge-organic">
              <SproutIcon size={12} />
              <span>100% Органика</span>
            </span>
          )}
          {isZeroWaste && (
            <span className="badge badge-zerowaste">
              <RecycleIcon size={12} />
              <span>Zero Waste</span>
            </span>
          )}
        </div>

        <img
          src={product.image || '/images/hero.jpg'}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/images/hero.jpg';
          }}
        />
      </div>

      <div className="card-content">
        <span className="card-category">{product.category || 'Эко-коллекция'}</span>
        <h3 className="card-title">{product.name}</h3>
        <p className="card-highlight">
          {product.category === 'Масла'
            ? 'Сыродавленное на дубовом прессе'
            : product.category === 'Мёд и пасека'
            ? 'Сырой, непастеризованный сбор'
            : 'Экологически чистый урожай'}
        </p>

        <div className="card-footer">
          <div className="card-price-block">
            <span className="card-price-label">Цена за {product.unit || 'шт'}</span>
            <span className="card-price">{Number(product.price).toLocaleString('ru-RU')} ₸</span>
          </div>

          <button
            type="button"
            className={`card-add-btn ${addedAnim ? 'added' : ''}`}
            onClick={handleAddToCart}
            aria-label={`Добавить в корзину: ${product.name}`}
          >
            {addedAnim ? (
              <>
                <CheckIcon size={14} />
                <span>Добавлено</span>
              </>
            ) : (
              <span>+ В корзину</span>
            )}
          </button>
        </div>
      </div>

      {onDelete && (
        <div className="admin-card-actions">
          <button
            type="button"
            className="card-delete-btn"
            disabled={deleting}
            onClick={handleDelete}
            aria-label={`Удалить ${product.name}`}
          >
            {deleting ? 'Удаление…' : 'Удалить (Админ)'}
          </button>
          {error && <p className="form-alert form-alert-error" role="alert">{error}</p>}
        </div>
      )}
    </article>
  );
}

export default ProductCard;
