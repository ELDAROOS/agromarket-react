import { createContext, useContext } from 'react';

export const CartContext = createContext(null);
export const MAX_CART_ITEMS = 50;
export const quantityLimit = (stock) => Math.min(stock ?? 100, 100);

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart must be used inside CartProvider');
  return cart;
}
