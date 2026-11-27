import { expect } from '@playwright/test';

export async function openLogin(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Войти в аккаунт' }).click();
  return page.getByRole('form', { name: 'Вход в аккаунт' });
}
export async function loginAdmin(page) {
  const form = await openLogin(page);
  await form.getByLabel('Email', { exact: true }).fill(process.env.E2E_FARMER_EMAIL);
  await form.getByLabel('Пароль', { exact: true }).fill(process.env.E2E_FARMER_PASSWORD);
  await form.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Профиль E2E Администратор' })).toBeVisible();
  await expect(form).not.toBeVisible();
}
