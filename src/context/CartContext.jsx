import { useEffect, useState } from 'react';
import { CartContext, MAX_CART_ITEMS, quantityLimit } from './cart';

const STORAGE_KEY = 'cart';

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    const items = new Map();
    for (const item of saved) {
      if (item && Number.isInteger(item.productId) && item.productId > 0 &&
          typeof item.name === 'string' && Number.isFinite(item.price) && item.price >= 0 &&
          Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 100) {
        const stock = Number.isInteger(item.stock) && item.stock >= 0 ? item.stock : undefined;
        items.set(item.productId, { ...item, stock });
      }
    }
    return [...items.values()].slice(0, MAX_CART_ITEMS);
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The cart can still work for this session if storage is unavailable.
    }
  }, [items]);

  function add(product) {
    const { id: productId, name, stock } = product;
    const price = Number(product.price);
    const limit = quantityLimit(stock);
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (limit === 0 || (existing?.quantity ?? 0) >= limit) return current;
      if (existing) {
        return current.map((item) => item.productId === productId
          ? { productId, name, price, stock, quantity: item.quantity + 1 } : item);
      }
      if (current.length >= MAX_CART_ITEMS) return current;
      return [...current, { productId, name, price, stock, quantity: 1 }];
    });
  }

  function adjust(productId, delta) {
    setItems((current) => current.map((item) => {
      if (item.productId !== productId) return item;
      if (delta > 0 && item.quantity >= quantityLimit(item.stock)) return item;
      return { ...item, quantity: item.quantity + delta };
    }).filter((item) => item.quantity > 0));
  }

  function remove(productId) {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }

  function updateAvailability(details) {
    const stock = new Map(details.map(({ productId, available }) => [productId, available]));
    setItems((current) => current.map((item) =>
      stock.has(item.productId) ? { ...item, stock: stock.get(item.productId) } : item));
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  return (
    <CartContext.Provider value={{ items, count, total, add, adjust, remove, updateAvailability, clear: () => setItems([]) }}>
      {children}
    </CartContext.Provider>
  );
}
