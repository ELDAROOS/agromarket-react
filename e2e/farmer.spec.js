import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { loginAdmin } from './helpers';

test.beforeEach(async ({ page }) => { await loginAdmin(page); });

test('администратор создаёт товар и удаляет его через интерфейс', async ({ page }) => {
  const name = `Тестовый мёд ${randomUUID()}`;
  await page.getByLabel(/название продукта/i).fill(name);
  await page.getByLabel('Категория', { exact: true }).fill('Мёд и пасека');
  await page.getByLabel(/цена/i).fill('3500');
  await page.getByLabel('Остаток').fill('8');
  await page.getByRole('button', { name: /опубликовать товар/i }).click();
  const card = page.getByTestId('product-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
  try {
    await expect(card).toBeVisible();
    await page.reload();
    await expect(card).toBeVisible();
    await card.getByRole('link', { name }).click();
    await page.getByRole('link', { name: 'Редактировать товар' }).click();
    await expect(page.getByLabel('Остаток')).toHaveValue('8');
    await page.getByLabel('Остаток').fill('0');
    await page.getByRole('button', { name: 'Сохранить изменения' }).click();
    await expect(page.getByRole('button', { name: 'Нет в наличии' })).toBeDisabled();
    await page.getByRole('link', { name: /вернуться в каталог/i }).click();
  } finally {
    // Основная очистка через UI; временная схема удалится и при падении проверки.
    page.once('dialog', (dialog) => dialog.accept());
    await card.getByRole('button', { name: `Удалить ${name}`, exact: true }).click();
    await expect(card).toHaveCount(0);
  }
});

test('браузер отклоняет цену -500 до запроса API', async ({ page }) => {
  let writes = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/products') writes++;
  });
  await page.getByLabel(/название продукта/i).fill('Тестовая отрицательная цена');
  const price = page.getByLabel(/цена/i);
  await price.fill('-500');
  await page.getByRole('button', { name: /опубликовать товар/i }).click();
  expect(await price.evaluate((input) => input.validity.rangeUnderflow)).toBe(true);
  await expect(price).toBeFocused();
  expect(await price.evaluate((input) => input.validationMessage)).not.toBe('');
  expect(writes).toBe(0);
});
