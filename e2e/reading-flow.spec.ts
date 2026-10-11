import { expect, test } from '@playwright/test';
import { fillAndSaveProfile, openFromMenu, register } from './helpers.ts';

// The critical flow of the product: profile, then advice, then keeping a title on the reading
// list. This is the reason the app exists, so it is covered from start to finish in one test.
test.describe('profile, advice and reading list', () => {
    test('a new student gets advice and keeps a title on the reading list', async ({ page }) => {
        await register(page, 'Flow Student');

        // Advice without a profile points the student to the profile page.
        await openFromMenu(page, 'Advies');
        await expect(page.getByRole('link', { name: 'Ga naar je leesprofiel' })).toBeVisible();

        await fillAndSaveProfile(page);

        await page.getByRole('link', { name: 'Bekijk je leesadvies' }).click();
        await expect(page).toHaveURL(/\/advice$/);
        await expect(page.getByRole('heading', { name: 'Jouw leesadvies' })).toBeVisible();
        await expect(
            page.getByRole('status').filter({ hasText: 'suggesties op basis van' }),
        ).toBeVisible();

        const cards = page.getByRole('article');
        await expect(cards.first()).toBeVisible();
        expect(await cards.count()).toBeGreaterThanOrEqual(3);
        await expect(
            cards.first().getByRole('heading', { name: 'Waarom dit bij je past' }),
        ).toBeVisible();

        // Keep the first suggestion.
        const addButton = page
            .getByRole('button', { name: /Voeg .* toe aan je leeslijst/ })
            .first();
        await addButton.click();
        await expect(
            page.getByRole('status').filter({ hasText: 'toegevoegd aan je leeslijst' }),
        ).toBeVisible();
        await expect(page.getByText('Op je leeslijst')).toHaveCount(1);

        // The title is on the list, can be marked as read and the progress follows.
        await openFromMenu(page, 'Leeslijst');
        await expect(
            page.getByRole('status').filter({ hasText: '0 van de 1 titels gelezen' }),
        ).toBeVisible();

        const readButton = page.getByRole('button', { name: /^Gelezen/ });
        await readButton.click();
        await expect(readButton).toHaveAttribute('aria-pressed', 'true');
        await expect(
            page.getByRole('status').filter({ hasText: '1 van de 1 titels gelezen' }),
        ).toBeVisible();

        // The state is stored on the server, not only in the page.
        await page.reload();
        await expect(
            page.getByRole('status').filter({ hasText: '1 van de 1 titels gelezen' }),
        ).toBeVisible();

        // Removing the title brings back the empty state.
        await page.getByRole('button', { name: /Verwijder .* van je leeslijst/ }).click();
        await expect(page.getByRole('heading', { name: 'Je leeslijst is leeg' })).toBeVisible();
    });

    test('an incomplete profile is not saved and focus moves to the error summary', async ({
        page,
    }) => {
        await register(page, 'Incomplete Profile');
        await page.goto('/profile');
        await page.getByRole('button', { name: 'Profiel opslaan' }).click();

        const summary = page.getByRole('alert').filter({ hasText: 'Pas het volgende aan' });
        await expect(summary).toBeVisible();
        await expect(summary).toBeFocused();
        await expect(summary.getByText('Kies je leesniveau')).toBeVisible();
        await expect(summary.getByText('Kies minstens één onderwerp')).toBeVisible();
    });

    test('the catalogue shows imported titles that can be searched', async ({ page }) => {
        await register(page, 'Catalogue Student');
        await expect(page.getByRole('article').first()).toBeVisible();

        await page.getByLabel('Zoek op titel, auteur of thema').fill('zzzz-no-such-title-zzzz');
        await page.getByRole('search').getByRole('button', { name: 'Zoeken' }).click();
        await expect(page.getByRole('heading', { name: 'Niets gevonden' })).toBeVisible();
    });
});
