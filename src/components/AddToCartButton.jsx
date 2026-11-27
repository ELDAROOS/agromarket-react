import { MAX_CART_ITEMS, quantityLimit, useCart } from '../context/cart';

export default function AddToCartButton({ product, inDetails = false }) {
  const { items, add } = useCart();
  const quantity = items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const soldOut = product.stock === 0;
  const cartFull = !quantity && items.length >= MAX_CART_ITEMS;
  const maxed = quantity >= quantityLimit(product.stock);
  const label = soldOut ? 'Нет в наличии' : inDetails ? 'Добавить в корзину' : '+ В корзину';

  return (
    <div className="cart-add">
      <button
        type="button"
        className={inDetails ? 'btn btn-primary' : 'card-add-btn'}
        disabled={soldOut || maxed || cartFull}
        onClick={() => add(product)}
        aria-label={!inDetails && !soldOut ? `Добавить в корзину: ${product.name}` : undefined}
      >
        {label}
      </button>
      {quantity > 0 && <small aria-live="polite">В корзине: {quantity}</small>}
      {cartFull && <small>В корзине уже 50 разных товаров</small>}
    </div>
  );
}
