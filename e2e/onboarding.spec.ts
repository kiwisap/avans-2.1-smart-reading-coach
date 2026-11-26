import { expect, test } from '@playwright/test';
import { register } from './helpers.ts';

// New students fill in their reading profile step by step, right after registering.
test.describe('onboarding', () => {
    test('a new student answers the questions and lands on the advice', async ({ page }) => {
        await register(page, `Quest Student ${Date.now()}`, undefined, { skipOnboarding: false });

        // No menu of the app yet, only the game and a way to skip it.
        await expect(page.getByRole('navigation', { name: 'Hoofdmenu' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Later invullen' })).toBeVisible();
        await page.getByRole('button', { name: 'Ik doe mee' }).click();

        // Level: continuing without an answer asks for one first.
        await expect(
            page.getByRole('heading', { name: 'Hoe makkelijk gaat lezen voor jou?' }),
        ).toBeFocused();
        await page.getByRole('button', { name: 'Volgende' }).click();
        await expect(page.getByRole('alert')).toContainText('Kies je leesniveau');
        await page.getByText('Gaat prima').click();
        await page.getByRole('button', { name: 'Volgende' }).click();

        // Material types: all of them, so the advice has enough titles.
        await expect(page.getByRole('heading', { name: 'Wat lees je graag?' })).toBeVisible();
        for (const box of await page.getByRole('checkbox').all()) await box.check({ force: true });
        await page.getByRole('button', { name: 'Volgende' }).click();

        // Topics come from the catalogue, so pick the first two.
        await expect(page.getByRole('heading', { name: 'Waar word jij blij van?' })).toBeVisible();
        const topics = page.getByRole('checkbox');
        await topics.nth(0).check({ force: true });
        await topics.nth(1).check({ force: true });
        await page.getByRole('button', { name: 'Volgende' }).click();

        await expect(page.getByRole('heading', { name: 'Hoeveel tijd heb jij?' })).toBeVisible();
        await page.getByText('Lekker tussendoor').click();
        await page.getByRole('button', { name: 'Volgende' }).click();

        await expect(page.getByRole('heading', { name: 'Waarom wil je lezen?' })).toBeVisible();
        await page.getByText('Voor de fun').click();
        await page.getByRole('button', { name: 'Klaar!' }).click();

        await expect(page.getByRole('heading', { name: 'Leesprofiel ontgrendeld!' })).toBeVisible();
        await page.getByRole('button', { name: 'Bekijk mijn leesadvies' }).click();
        await expect(page).toHaveURL(/\/advice$/);
        await expect(
            page.getByRole('status').filter({ hasText: 'suggesties op basis van' }),
        ).toBeVisible();
    });

    test('a student can skip it and fill in the profile later', async ({ page }) => {
        await register(page, `Skip Student ${Date.now()}`);
        await page.goto('/profile');
        await expect(page.getByRole('link', { name: 'Vul je profiel in met Bo' })).toBeVisible();
    });
});
