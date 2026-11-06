import { useEffect, useState } from 'react';

import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import ContactForm from './components/ContactForm';
import LoginForm from './components/LoginForm';
import PasswordForm from './components/PasswordForm';
import AddProductForm from './components/AddProductForm';
import OrdersPanel from './components/OrdersPanel';
import CartDrawer from './components/CartDrawer';
import {
  SproutIcon,
  FlaskIcon,
  LeafIcon,
  RecycleIcon,
  TruckIcon,
  HoneycombIcon,
  DropIcon,
  TeaCupIcon,
  WheatIcon,
  SearchIcon,
  ArrowRightIcon,
} from './components/Icons';

import { loadAllProducts, apiFetch, saveSession, clearSession } from './api';

// Запасной органический каталог на случай временной недоступности бэкенда
const fallbackProducts = [
  {
    id: 1,
    name: 'Дикий донниковый мёд, 400 г',
    category: 'Мёд и пасека',
    price: 3450,
    unit: 'шт',
    image: '/images/honey.jpg',
  },
  {
    id: 2,
    name: 'Сыродавленное кедровое масло, 250 мл',
    category: 'Масла',
    price: 4800,
    unit: 'шт',
    image: '/images/cedar-oil.jpg',
  },
  {
    id: 3,
    name: 'Альпийский горный сбор, 100 г',
    category: 'Чай и травы',
    price: 1850,
    unit: 'шт',
    image: '/images/herbal-tea.jpg',
  },
  {
    id: 4,
    name: 'Органический горный лён, 500 г',
    category: 'Злаки и семена',
    price: 1200,
    unit: 'шт',
    image: '/images/hero.jpg',
  },
];

function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(() => Boolean(localStorage.getItem('token')));
  const [authMessage, setAuthMessage] = useState('');
  const [ordersRevision, setOrdersRevision] = useState(0);

  // Авторизация
  function handleLogin(account, token) {
    saveSession(account, token);
    setUser(account);
    setCheckingAuth(false);
    setAuthMessage('');
    setIsAuthModalOpen(false);
  }

  function handleLogout() {
    clearSession();
    setUser(null);
    setAuthMessage('');
    setIsAuthModalOpen(false);
  }

  useEffect(() => {
    const expired = () => {
      setUser(null);
      setAuthMessage('Сеанс завершён. Войдите снова.');
    };
    const changed = (event) => {
      if (event.key === 'token' || event.key === null) window.location.reload();
    };
    window.addEventListener('session-expired', expired);
    window.addEventListener('storage', changed);
    const controller = new AbortController();
    const token = localStorage.getItem('token');
    if (token) {
      apiFetch('/auth/me', { signal: controller.signal })
        .then((account) => {
          if (localStorage.getItem('token') === token) {
            localStorage.setItem('user', JSON.stringify(account));
            setUser(account);
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted) setAuthMessage(err.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setCheckingAuth(false);
        });
    } else {
      localStorage.removeItem('user');
    }
    return () => {
      controller.abort();
      window.removeEventListener('session-expired', expired);
      window.removeEventListener('storage', changed);
    };
  }, []);

  // Удаление товара (администратор)
  async function handleDelete(product) {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) return;
    await apiFetch(`/products/${product.id}`, { method: 'DELETE' });
    setProducts((items) => items.filter((item) => item.id !== product.id));
    setCartItems((items) => items.filter((item) => item.product.id !== product.id));
    setOrdersRevision((n) => n + 1);
  }

  // Загрузка товаров с Express API с безопасным fallback
  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        const data = await loadAllProducts(controller.signal);
        setProducts(data && data.length > 0 ? data : fallbackProducts);
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn('API недоступен, загружен автономный каталог:', err);
        setError('Сервер временно недоступен. Загружен автономный эко-каталог.');
        setProducts(fallbackProducts);
        setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  // Управление корзиной
  function handleAddToCart(product) {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  }

  function handleUpdateCartQty(productId, delta) {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }

  function handleRemoveFromCart(productId) {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  }

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Фильтрация товаров по поиску и категориям
  const categories = [
    { id: 'all', label: 'Все товары', icon: null },
    { id: 'Мёд и пасека', label: 'Дикий мёд', icon: <HoneycombIcon size={14} /> },
    { id: 'Масла', label: 'Сыродавленные масла', icon: <DropIcon size={14} /> },
    { id: 'Чай и травы', label: 'Чай и сборы', icon: <TeaCupIcon size={14} /> },
    { id: 'Злаки и семена', label: 'Злаки и семена', icon: <WheatIcon size={14} /> },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Масла' && product.name.toLowerCase().includes('масло')) ||
      (selectedCategory === 'Мёд и пасека' && product.name.toLowerCase().includes('мёд')) ||
      (selectedCategory === 'Чай и травы' && product.name.toLowerCase().includes('сбор'));
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Шапка сайта */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Шторка корзины */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Модальное окно аккаунта */}
      {isAuthModalOpen && (
        <div className="account-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
          <div className="account-card-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="close-btn"
              onClick={() => setIsAuthModalOpen(false)}
              aria-label="Закрыть окно"
            >
              ✕
            </button>

            {checkingAuth ? (
              <p style={{ textAlign: 'center', padding: '32px 0' }}>Проверка авторизации…</p>
            ) : user ? (
              <div>
                <div className="account-header-status">
                  <div className="account-user-badge">
                    <b>{user.name}</b>
                    <span>{user.email} • Роль: {user.role === 'admin' ? 'Администратор' : 'Покупатель'}</span>
                  </div>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 16px', fontSize: '13px' }} onClick={handleLogout}>
                    Выйти
                  </button>
                </div>
                <PasswordForm onChanged={handleLogin} />
              </div>
            ) : (
              <div>
                {authMessage && <div className="form-alert form-alert-error" style={{ marginBottom: '14px' }}>{authMessage}</div>}
                <LoginForm onLogin={handleLogin} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Панель добавления товара (только для Администратора) */}
      {user?.role === 'admin' && (
        <AddProductForm onAdded={(product) => setProducts((items) => [...items, product])} />
      )}

      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <span className="hero-tag">
                <SproutIcon size={14} />
                <span>Сезонный сбор 2026 • Прямо с пасек и полей</span>
              </span>
              <h1 className="hero-title">
                Чистая польза <span>дикой природы</span> для вашего дома
              </h1>
              <p className="hero-desc">
                Органические натуральные продукты, сыродавленные на деревянном прессе масла и дикий мёд без сахара и консервантов. Честный эко-состав от семейных ферм с доставкой день в день.
              </p>

              <div className="hero-cta-group">
                <a href="#catalog" className="btn btn-cta">
                  <span>Собрать эко-корзину</span>
                  <ArrowRightIcon size={16} />
                </a>
                <a href="#trust" className="btn btn-secondary">
                  О происхождении продуктов
                </a>
              </div>

              <div className="hero-metrics">
                <div className="metric-item">
                  <span className="metric-num">38+</span>
                  <span className="metric-label">Семейных эко-ферм</span>
                </div>
                <div className="metric-item">
                  <span className="metric-num">0%</span>
                  <span className="metric-label">Синтетики и сахара</span>
                </div>
                <div className="metric-item">
                  <span className="metric-num">100%</span>
                  <span className="metric-label">Zero Waste тара</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-media-card">
                <img
                  src="/images/hero.jpg"
                  alt="Органические продукты VÉRITÉ на натуральном камне"
                />
              </div>
              <div className="hero-floating-card">
                <div className="floating-icon" style={{ color: 'var(--color-primary)' }}>
                  <FlaskIcon size={20} />
                </div>
                <div className="floating-text">
                  <h4>ISO 17065 Certified</h4>
                  <p>Каждая партия протестирована в независимой био-лаборатории</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUES & PHILOSOPHY BAR */}
      <section id="values" className="values-bar">
        <div className="container">
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon" style={{ color: 'var(--color-primary)' }}>
                <LeafIcon size={22} />
              </div>
              <div className="value-info">
                <h4>100% Органика</h4>
                <p>Никаких химических удобрений</p>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon" style={{ color: 'var(--color-primary)' }}>
                <RecycleIcon size={22} />
              </div>
              <div className="value-info">
                <h4>Zero Waste</h4>
                <p>Возвратная стеклянная тара</p>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon" style={{ color: 'var(--color-primary)' }}>
                <TruckIcon size={22} />
              </div>
              <div className="value-info">
                <h4>Климат-контроль</h4>
                <p>Сохранение живых энзимов</p>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon" style={{ color: 'var(--color-primary)' }}>
                <HoneycombIcon size={22} />
              </div>
              <div className="value-info">
                <h4>Честный состав</h4>
                <p>Без скрытого сахара и патоки</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATALOG & QUICK FILTERS */}
      <section id="catalog" className="catalog-section">
        <div className="container">
          <div className="catalog-header">
            <span className="catalog-pretitle">Органическая коллекция</span>
            <h2 className="catalog-title">Каталог натуральных продуктов</h2>
          </div>

          <div className="catalog-filter-bar">
            <div className="filter-chips">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="search-box">
              <span className="search-icon">
                <SearchIcon size={16} />
              </span>
              <input
                type="search"
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Поиск по названию продукта"
              />
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)' }}>
              Загрузка каталога…
            </p>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--color-secondary)' }}>
                <WheatIcon size={44} />
              </div>
              <h3>Товары не найдены</h3>
              <p>Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAddToCart}
                  featured={String(product.id) === '1'}
                  onDelete={user?.role === 'admin' ? handleDelete : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. TRUST & PROOF OF ORIGIN */}
      <section id="trust" className="trust-section">
        <div className="container">
          <div className="section-head">
            <span className="section-pretitle">От пасеки до стола</span>
            <h2 className="section-title">Прозрачная цепочка качества</h2>
            <p className="section-subtitle">
              Мы лично знаем каждого пчеловода и маслодела. Процесс строго контролируется на всех этапах.
            </p>
          </div>

          <div className="trust-timeline">
            <div className="timeline-step">
              <div className="step-number">1</div>
              <h4 className="step-title">Дикий сбор</h4>
              <p className="step-desc">Сбор мёда и дикоросов в заповедных зонах, удалённых от трасс и производств.</p>
            </div>
            <div className="timeline-step">
              <div className="step-number">2</div>
              <h4 className="step-title">Лабораторный тест</h4>
              <p className="step-desc">Проверка на чистоту от пестицидов, антибиотиков и тяжёлых металлов.</p>
            </div>
            <div className="timeline-step">
              <div className="step-number">3</div>
              <h4 className="step-title">Эко-упаковка</h4>
              <p className="step-desc">Фасовка в тёмное аптечное стекло и крафт, сохраняющие витамины от света.</p>
            </div>
            <div className="timeline-step">
              <div className="step-number">4</div>
              <h4 className="step-title">Свежая доставка</h4>
              <p className="step-desc">Быстрая доставка с климат-контролем прямо к вашей двери.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHOLESALE & ORDER FORM */}
      <ContactForm
        products={products}
        productsLoading={loading}
        onCreated={() => setOrdersRevision((n) => n + 1)}
      />

      {/* 6. ORDERS PANEL (ДЛЯ АВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ И АДМИНА) */}
      {user && (
        <OrdersPanel
          key={`${user.id}-${user.role}`}
          admin={user.role === 'admin'}
          revision={ordersRevision}
        />
      )}

      {/* 7. FOOTER */}
      <Footer />
    </>
  );
}

export default App;
