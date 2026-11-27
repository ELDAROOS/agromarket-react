import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SproutIcon, RecycleIcon, StarIcon } from './Icons';
import AddToCartButton from './AddToCartButton';

function ProductCard({ product, featured = false, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

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
        <h3 className="card-title"><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
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

          <AddToCartButton product={product} />
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
