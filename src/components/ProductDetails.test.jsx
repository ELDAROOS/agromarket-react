import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { renderWithProviders } from '../test/utils';

test('прямая ссылка загружает отдельный товар из API', async () => {
  renderWithProviders(<App />, { route: '/products/1' });
  expect(await screen.findByRole('heading', { level: 1, name: 'Мёд гречишный' })).toBeInTheDocument();
  expect(screen.getByText(/3\s?500 ₸/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /вернуться в каталог/i })).toHaveAttribute('href', '/#catalog');
});

test('404 страницы товара показывает ошибку API', async () => {
  renderWithProviders(<App />, { route: '/products/999' });
  expect(await screen.findByRole('alert')).toHaveTextContent('Товар не найден');
  expect(screen.queryByRole('button', { name: 'Добавить в корзину', exact: true })).not.toBeInTheDocument();
});

test('переход из карточки открывает страницу товара', async () => {
  const user = userEvent.setup();
  renderWithProviders(<App />);
  await user.click(await screen.findByRole('link', { name: 'Мёд гречишный', exact: true }));
  expect(await screen.findByRole('heading', { level: 1, name: 'Мёд гречишный' })).toBeInTheDocument();
});

test('товар со страницы товара открывается в корзине', async () => {
  const user = userEvent.setup();
  renderWithProviders(<App />, { route: '/products/1' });
  await user.click(await screen.findByRole('button', { name: 'Добавить в корзину', exact: true }));
  await user.click(screen.getByRole('link', { name: 'Корзина (1)' }));
  expect(await screen.findByRole('heading', { name: 'Корзина' })).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveTextContent('Мёд гречишный');
});
