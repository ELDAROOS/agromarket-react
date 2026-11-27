import { test, expect } from '@playwright/test';

test('@smoke главная загружает реальные товары из API', async ({ page }) => {
  const responsePromise = page.waitForResponse((response) =>
    new URL(response.url()).pathname.endsWith('/api/products') && response.request().method() === 'GET');
  await page.goto('/');
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  const products = await response.json();
  expect(products.length).toBeGreaterThan(0);
  await expect(page).toHaveTitle(/АгроМаркет/);
  await expect(page.getByTestId('product-card').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: products[0].name, exact: true })).toBeVisible();
});

test('@smoke страница товара открывается из каталога и после обновления', async ({ page }) => {
  await page.goto('/');
  const link = page.getByTestId('product-card').first().getByRole('link');
  const name = await link.innerText();
  await link.click();
  await expect(page).toHaveURL(/\/products\/\d+$/);
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
});

test('@smoke корзина открывается', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Корзина', exact: true })).toBeVisible();
});
