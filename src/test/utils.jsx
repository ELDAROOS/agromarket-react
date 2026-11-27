import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../context/CartContext';

// Авторизация в этом проекте хранится в App и localStorage; отдельного AuthProvider нет.
export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}><CartProvider>{ui}</CartProvider></MemoryRouter>);
}
