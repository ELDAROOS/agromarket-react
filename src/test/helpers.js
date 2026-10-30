import { vi } from 'vitest';
export const products = [
  { id: 1, name: 'Мёд гречишный', price: 3500, category: 'Мёд и пасека' },
  { id: 2, name: 'Пшеница 3 класса', price: 120, category: 'Злаки и семена' },
];
export function mockFetch(body, status = 200) {
  return vi.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  }));
}
