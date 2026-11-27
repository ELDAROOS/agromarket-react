import { WheatIcon, LeafIcon, UserIcon, ShoppingBagIcon } from './Icons';
import { useCart } from '../context/cart';
import { Link } from 'react-router-dom';

function Header({ user, onOpenAuth }) {
  const { count } = useCart();
  return (
    <div className="site-header-wrapper">
      {/* Верхний информационный тикер */}
      <div className="ticker-bar">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <LeafIcon size={14} />
          <span>Бережная эко-доставка день в день • <span className="ticker-highlight">Бесплатно от 20 000 ₸</span> • 100% возврат стеклянной тары</span>
        </span>
      </div>

      {/* Основная фиксированная навигационная панель */}
      <header className="site-header">
        <div className="container header-container">
          <Link to="/" className="brand">
            <span className="brand-logo">
              <WheatIcon size={24} />
              <span>VÉRITÉ</span>
            </span>
            <span className="brand-subtitle">АгроМаркет • Épicerie Naturelle</span>
          </Link>

          <nav aria-label="Основная навигация">
            <ul className="nav-links">
              <li><Link to="/#catalog">Каталог</Link></li>
              <li><Link to="/#values">Ценности</Link></li>
              <li><Link to="/#trust">Происхождение</Link></li>
              <li><Link to="/#contact">Оптовый заказ</Link></li>
              {user && <li><Link to="/orders">Мои заказы</Link></li>}
              {user?.role === 'farmer' && <li><Link to="/orders/incoming">Заказы на мои товары</Link></li>}
            </ul>
          </nav>

          <div className="header-actions">
            {/* Кнопка входа / профиля */}
            <button
              type="button"
              className="header-auth-btn"
              onClick={onOpenAuth}
              aria-label={user ? `Профиль ${user.name}` : 'Войти в аккаунт'}
            >
              <UserIcon size={17} />
              <span>{user ? user.name : 'Войти'}</span>
            </button>

            {/* Интерактивная кнопка корзины */}
            <Link to="/cart" className="cart-toggle-btn" aria-label={`Корзина (${count})`}>
              <ShoppingBagIcon size={18} />
              <span>Корзина</span>
              <span className="cart-badge">{count}</span>
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
