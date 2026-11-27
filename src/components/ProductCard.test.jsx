import { screen } from '@testing-library/react';
import ProductCard from './ProductCard';
import { renderWithProviders } from '../test/utils';
import { products } from '../test/handlers';

describe('ProductCard', () => {
  test('показывает название, цену, категорию и единицу измерения', () => {
    renderWithProviders(<ProductCard product={products[0]} />);
    expect(screen.getByRole('heading', { name: 'Мёд гречишный' })).toBeInTheDocument();
    expect(screen.getByText(/3\s?500 ₸/)).toBeInTheDocument();
    expect(screen.getByText('Мёд и пасека')).toBeInTheDocument();
    expect(screen.getByText('Цена за кг')).toBeInTheDocument();
  });
  test('название ведёт на страницу товара', () => {
    renderWithProviders(<ProductCard product={products[0]} />);
    expect(screen.getByRole('link', { name: 'Мёд гречишный' })).toHaveAttribute('href', '/products/1');
  });
  test('не показывает удаление покупателю', () => {
    renderWithProviders(<ProductCard product={products[0]} />);
    expect(screen.queryByRole('button', { name: /удалить/i })).not.toBeInTheDocument();
  });
});
