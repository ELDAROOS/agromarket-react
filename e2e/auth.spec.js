import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { openLogin } from './helpers';

test('покупатель регистрируется, сохраняет сессию после обновления и выходит', async ({ page }) => {
  await openLogin(page);
  await page.getByRole('button', { name: /создать профиль/i }).click();
  const form = page.getByRole('form', { name: 'Регистрация аккаунта' });
  await form.getByLabel('Ваше имя').fill('E2E Покупатель');
  await form.getByLabel('Email', { exact: true }).fill(`e2e-${randomUUID()}@test.kz`);
  await form.getByLabel('Пароль', { exact: true }).fill(randomUUID());
  await form.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  const profile = page.getByRole('button', { name: 'Профиль E2E Покупатель' });
  await expect(profile).toBeVisible();
  await page.reload();
  await expect(profile).toBeVisible();
  await profile.click();
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Войти в аккаунт' })).toBeVisible();
});

test('неверный пароль показывает ошибку и оставляет форму входа открытой', async ({ page }) => {
  const form = await openLogin(page);
  await form.getByLabel('Email', { exact: true }).fill('nobody@test.kz');
  await form.getByLabel('Пароль', { exact: true }).fill('wrong-password');
  await form.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(form.getByRole('alert')).toHaveText('Неверный email или пароль');
  await expect(form).toBeVisible();
  await expect(page.getByRole('button', { name: /профиль /i })).toHaveCount(0);
});
