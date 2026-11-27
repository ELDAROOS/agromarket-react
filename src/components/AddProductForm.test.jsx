import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import AddProductForm from './AddProductForm';
import { renderWithProviders } from '../test/utils';
import { server } from '../test/server';

test('серверная валидация отрицательной цены показывает details', async () => {
  let submitted;
  server.use(http.post('*/api/products', async ({ request }) => {
    submitted = await request.json();
    return HttpResponse.json({ error: 'Ошибка валидации', details: [
      { field: 'price', message: 'Цена должна быть больше 0' },
    ] }, { status: 400 });
  }));
  const user = userEvent.setup();
  const onAdded = vi.fn();
  renderWithProviders(<AddProductForm onAdded={onAdded} />);
  await user.type(screen.getByLabelText(/название продукта/i), 'Тестовый мёд');
  await user.type(screen.getByLabelText(/цена/i), '-500');
  // Обходим HTML-валидацию намеренно, чтобы отдельно проверить ответ сервера.
  fireEvent.submit(screen.getByRole('button', { name: /опубликовать товар/i }).closest('form'));
  expect(within(await screen.findByRole('alert')).getByText('Цена должна быть больше 0')).toBeInTheDocument();
  expect(submitted.price).toBe(-500);
  expect(screen.getByLabelText(/цена/i)).toHaveAttribute('aria-invalid', 'true');
  expect(onAdded).not.toHaveBeenCalled();
});
