import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import AddToCartButton from './AddToCartButton';
import AddProductForm from './AddProductForm';

export default function ProductDetails({ user, editing = false, checkingAuth = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [state, setState] = useState({ id, product: null, error: '', loading: true });

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/products/${encodeURIComponent(id)}`, { signal: controller.signal, auth: false })
      .then((product) => {
        if (!controller.signal.aborted) setState({ id, product, error: '', loading: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ id, product: null, error: error.message, loading: false });
      });
    return () => controller.abort();
  }, [id]);

  const { product, error, loading } = state.id === id ? state : { product: null, error: '', loading: true };
  const canEdit = user?.role === 'admin' || (user?.role === 'farmer' && product?.farmer_id === user.id);
  if (editing && product && !checkingAuth && canEdit) {
    return <AddProductForm key={id} product={product} onAdded={(updated) => {
      setState({ id, product: updated, error: '', loading: false });
      navigate(`/products/${id}`);
    }} />;
  }
  return (
    <main className="container product-details">
      <Link to="/#catalog" className="btn btn-secondary">← Вернуться в каталог</Link>
      {loading && <p role="status">Загрузка товара…</p>}
      {error && <p role="alert" className="form-alert form-alert-error">{error}</p>}
      {editing && product && checkingAuth && <p role="status">Проверка авторизации…</p>}
      {editing && product && !checkingAuth && <p role="alert">Редактирование товара недоступно</p>}
      {!editing && product && (
        <article className="product-details-grid">
          <img src={product.image || '/images/hero.jpg'} alt={product.name} />
          <div>
            <span className="card-category">{product.category || 'Эко-коллекция'}</span>
            <h1>{product.name}</h1>
            <p className="card-price">{Number(product.price).toLocaleString('ru-RU')} ₸</p>
            <p>Цена за {product.unit || 'шт'}</p>
            <AddToCartButton product={product} inDetails />
            {canEdit && <p><Link to={`/products/${id}/edit`}>Редактировать товар</Link></p>}
          </div>
        </article>
      )}
    </main>
  );
}
