import { expect, test } from '@playwright/test';
import { register } from './helpers.ts';

// Risk: the API is slow, down or answers with something unexpected. The user must see a clear
// message and a way forward, never a white page.
test.describe('error handling in the browser', () => {
    test('a failed catalogue request shows a message and the retry button recovers', async ({
        page,
    }) => {
        await register(page, 'Resilient Student');

        // The catalogue request fails, as if the server is unreachable.
        await page.route(/\/api\/books\?/, (route) => route.abort('connectionrefused'));
        await page.goto('/?search=a');

        const alert = page.getByRole('alert').filter({ hasText: 'De server is niet bereikbaar' });
        await expect(alert).toBeVisible();

        // The server is back: retrying loads the catalogue without reloading the page.
        await page.unroute(/\/api\/books\?/);
        await alert.getByRole('button', { name: 'Probeer opnieuw' }).click();
        await expect(alert).toHaveCount(0);
        await expect(
            page.getByRole('status').filter({ hasText: /resultaat|resultaten/ }),
        ).toBeVisible();
    });

    test('an unexpected API answer is caught by the error boundary', async ({ page }) => {
        await register(page, 'Boundary Student');

        // A 200 answer without the expected fields makes the filter form throw while rendering.
        await page.route(/\/api\/books\/filters/, (route) =>
            route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
        );
        await page.goto('/');

        const fallback = page.getByRole('alert').filter({ hasText: 'Er ging iets mis' });
        await expect(fallback).toBeVisible();
        // The menu is outside the boundary and keeps working, so the user can leave.
        await expect(page.getByRole('navigation', { name: 'Hoofdmenu' })).toBeVisible();
        await expect(fallback.getByRole('link', { name: 'Terug naar de catalogus' })).toBeVisible();
    });
});
