import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../components/ProductCard';
import { renderWithProviders } from '../test/utils';

const honey = { id: 1, name: 'Мёд гречишный', price: 3500, stock: 2 };
const addButton = () => screen.getByRole('button', { name: 'Добавить в корзину: Мёд гречишный' });

test('два клика сохраняют одну позицию с количеством 2', async () => {
  const user = userEvent.setup();
  renderWithProviders(<ProductCard product={honey} />);
  await user.click(addButton());
  await user.click(addButton());
  expect(JSON.parse(localStorage.getItem('cart'))).toEqual([
    { productId: 1, name: honey.name, price: 3500, stock: 2, quantity: 2 },
  ]);
});

test('нельзя добавить больше текущего остатка', async () => {
  const user = userEvent.setup();
  renderWithProviders(<ProductCard product={{ ...honey, stock: 1 }} />);
  await user.click(addButton());
  expect(addButton()).toBeDisabled();
  expect(screen.getByText('В корзине: 1')).toBeInTheDocument();
});

test('при нулевом остатке кнопка недоступна', () => {
  renderWithProviders(<ProductCard product={{ ...honey, stock: 0 }} />);
  expect(screen.getByRole('button', { name: 'Нет в наличии' })).toBeDisabled();
});

test('после повторного монтирования читается сохранённая корзина', async () => {
  const user = userEvent.setup();
  const { unmount } = renderWithProviders(<ProductCard product={honey} />);
  await user.click(addButton());
  unmount();
  renderWithProviders(<ProductCard product={honey} />);
  expect(screen.getByText('В корзине: 1')).toBeInTheDocument();
});
