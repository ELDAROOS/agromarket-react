import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('каталог загружается с настоящего сервера', async ({ page }) => {
  const responsePromise = page.waitForResponse(r => new URL(r.url()).pathname === '/api/products' && r.request().method() === 'GET');
  await page.goto('/');
  await expect(page).toHaveTitle(/VÉRITÉ|АгроМаркет/i);
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const products = await response.json();
  expect(products.length).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { name: products[0].name, exact: true })).toBeVisible();
});

test('прямая ссылка на страницу входа не даёт 404', async ({ page }) => {
  const response = await page.goto('/login');
  expect(response.status()).toBe(200);
  await expect(page.getByRole('form', { name: 'Вход в аккаунт' })).toBeVisible();
});

test('покупатель регистрируется, входит и оформляет заявку', async ({ page }) => {
  const email = `e2e+${randomUUID()}@agromarket.test`;
  const password = 'E2e-Test-Password-123';
  await page.goto('/register');
  const registration = page.getByRole('form', { name: 'Регистрация аккаунта' });
  await registration.getByLabel('Ваше имя', { exact: true }).fill('E2E Покупатель');
  await registration.getByLabel('Email', { exact: true }).fill(email);
  await registration.getByLabel('Пароль', { exact: true }).fill(password);
  await registration.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Профиль E2E Покупатель' })).toBeVisible();
  await page.getByRole('button', { name: 'Профиль E2E Покупатель' }).click();
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await page.goto('/login');
  const login = page.getByRole('form', { name: 'Вход в аккаунт' });
  await login.getByLabel('Email', { exact: true }).fill(email);
  await login.getByLabel('Пароль', { exact: true }).fill(password);
  await login.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Профиль E2E Покупатель' })).toBeVisible();
  const card = page.getByTestId('product-card').first();
  const productName = await card.getByRole('heading').innerText();
  await card.getByRole('button', { name: /Добавить в корзину/ }).click();
  await page.getByRole('button', { name: 'Открыть корзину: 1 товаров' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Оформить заявку' }).click();
  // Оптовая заявка содержит один товар и минимум 10 кг; корзина считает розничные единицы.
  const productSelect = page.getByLabel(/Выбор товара/);
  const option = productSelect.getByRole('option').filter({ hasText: productName });
  await productSelect.selectOption(await option.getAttribute('value'));
  await page.getByLabel(/Ваше имя \/ Компания/).fill('E2E Покупатель');
  await page.getByLabel('Email *', { exact: true }).fill(email);
  await page.getByLabel(/Контактный телефон/).fill('+77001234567');
  await page.getByLabel(/Объём заказа/).fill('10');
  await page.getByLabel(/Комментарий к заказу/).fill('Учебная E2E-заявка. Не обрабатывать.');
  const orderPromise = page.waitForResponse(r => new URL(r.url()).pathname === '/api/orders' && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Отправить заявку' }).click();
  const response = await orderPromise;
  expect(response.status()).toBe(201);
  const order = await response.json();
  await expect(page.getByRole('status').filter({ hasText: `Заявка №${order.id} успешно принята` })).toBeVisible();
  await expect(page.getByRole('cell', { name: `#${order.id}`, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Профиль E2E Покупатель' })).toBeVisible();
  await expect(page.getByRole('cell', { name: `#${order.id}`, exact: true })).toBeVisible();
});

test('гостю запрещён доступ к администрированию', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('alert').filter({ hasText: 'Нет доступа' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Все оптовые заявки' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Удалить/ })).toHaveCount(0);
});
