import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { openLogin } from './helpers';

test('покупатель оформляет заказ и отменяет его с возвратом остатка', async ({ page }) => {
  await openLogin(page);
  await page.getByRole('button', { name: /создать профиль/i }).click();
  const registration = page.getByRole('form', { name: 'Регистрация аккаунта' });
  await registration.getByLabel('Ваше имя').fill('E2E Покупатель');
  await registration.getByLabel('Email').fill(`buyer-${randomUUID()}@test.kz`);
  await registration.getByLabel('Пароль', { exact: true }).fill('12345678');
  await registration.getByRole('button', { name: /зарегистрировать/i }).click();
  await expect(page.getByRole('button', { name: 'Профиль E2E Покупатель' })).toBeVisible();

  const card = page.getByTestId('product-card').first();
  const name = await card.getByRole('heading').innerText();
  const productId = (await card.getByRole('link', { name, exact: true }).getAttribute('href')).split('/').pop();
  const productURL = `http://127.0.0.1:3100/api/products/${productId}`;
  const stockBefore = (await (await page.request.get(productURL)).json()).stock;
  await card.getByRole('button', { name: /добавить в корзину/i }).click();
  await page.getByRole('link', { name: 'Корзина (1)' }).click();
  await page.reload();
  await expect(page.getByRole('main').getByRole('link', { name })).toBeVisible();
  await page.getByLabel('Адрес доставки').fill('Астана, ул. Женис, 62');
  await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();

  await expect(page).toHaveURL(/\/orders\?created=\d+$/);
  await expect(page.getByText(/Заказ №\d+ оформлен/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Корзина (0)' })).toBeVisible();
  expect((await (await page.request.get(productURL)).json()).stock).toBe(stockBefore - 1);

  await page.getByRole('button', { name: 'Отменить', exact: true }).click();
  await expect(page.getByText(/Отменён/)).toBeVisible();
  expect((await (await page.request.get(productURL)).json()).stock).toBe(stockBefore);
});
