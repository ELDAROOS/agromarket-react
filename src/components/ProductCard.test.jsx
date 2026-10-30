import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';
import { products } from '../test/helpers';
const product = products[0];
describe('ProductCard', () => {
  test('показывает название, цену и категорию из props', () => {
    render(<ProductCard product={product} onAdd={vi.fn()} />);
    expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument();
    expect(screen.getByText(/3\s?500 ₸/)).toBeInTheDocument();
    expect(screen.getByText(product.category)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: product.name })).toBeInTheDocument();
  });
  test('добавляет именно выбранный товар ровно один раз', async () => {
    const onAdd = vi.fn();
    render(<ProductCard product={product} onAdd={onAdd} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Добавить в корзину/ }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(product);
    expect(screen.getByText('Добавлено')).toBeInTheDocument();
  });
  test('не предлагает удаление обычному покупателю', () => {
    render(<ProductCard product={product} onAdd={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Удалить/ })).not.toBeInTheDocument();
  });
  test('показывает ошибку удаления администратору', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('Удаление запрещено'));
    render(<ProductCard product={product} onAdd={vi.fn()} onDelete={onDelete} />);
    await userEvent.setup().click(screen.getByRole('button', { name: /Удалить/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Удаление запрещено');
    expect(onDelete).toHaveBeenCalledWith(product);
  });
});
