import { test, expect } from '@playwright/test';
import { instant } from '@next/playwright';

test.describe('instant navigation: home to writing', () => {
  test('writing shell commits on client navigation', async ({ page, baseURL }) => {
    await page.goto('/');
    const trigger = page.getByTestId('writing-link');
    await expect(trigger).toBeVisible();

    await instant(
      page,
      async () => {
        await trigger.click();
        await expect(page.getByTestId('writing-shell-marker')).toBeVisible();
      },
      { baseURL },
    );
  });

  test('writing shell is served on initial load', async ({ page, baseURL }) => {
    await instant(
      page,
      async () => {
        await page.goto('/writing');
        await expect(page.getByTestId('writing-shell-marker')).toBeVisible();
      },
      { baseURL },
    );
  });
});

test.describe('instant navigation: writing to article', () => {
  test('article shell commits on client navigation', async ({ page, baseURL }) => {
    await page.goto('/writing');
    const trigger = page.getByTestId('writing-post-link').first();
    await expect(trigger).toBeVisible();

    await instant(
      page,
      async () => {
        await trigger.click();
        await expect(page.getByTestId('writing-post-shell-marker')).toBeVisible();
        await expect(page.getByTestId('writing-post-content')).toHaveCount(0);
      },
      { baseURL },
    );

    await expect(page.getByTestId('writing-post-content')).toBeVisible();
  });

  test('article shell is served on initial load', async ({ page, baseURL }) => {
    await instant(
      page,
      async () => {
        await page.goto('/writing/stack');
        await expect(page.getByTestId('writing-post-shell-marker')).toBeVisible();
        await expect(page.getByTestId('writing-post-content')).toBeVisible();
      },
      { baseURL },
    );
  });
});
