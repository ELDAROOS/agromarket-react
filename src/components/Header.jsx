import { WheatIcon, LeafIcon, UserIcon, ShoppingBagIcon } from './Icons';

function Header({ cartCount = 0, onOpenCart, user, onOpenAuth }) {
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
          <a href="#" className="brand">
            <span className="brand-logo">
              <WheatIcon size={24} />
              <span>VÉRITÉ</span>
            </span>
            <span className="brand-subtitle">АгроМаркет • Épicerie Naturelle</span>
          </a>

          <nav aria-label="Основная навигация">
            <ul className="nav-links">
              <li><a href="#catalog">Каталог</a></li>
              <li><a href="#values">Ценности</a></li>
              <li><a href="#trust">Происхождение</a></li>
              <li><a href="#contact">Оптовый заказ</a></li>
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
            <button
              type="button"
              className="cart-toggle-btn"
              onClick={onOpenCart}
              aria-label={`Открыть корзину: ${cartCount} товаров`}
            >
              <ShoppingBagIcon size={18} />
              <span>Корзина</span>
              <span className="cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;