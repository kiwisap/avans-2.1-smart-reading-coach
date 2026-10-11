import { expect, test } from '@playwright/test';
import { PASSWORD, login, loginAndWait, logout, register, uniqueEmail } from './helpers.ts';

// Risk: if people cannot log in, or can see pages that are not theirs, nothing else matters.
test.describe('authentication and route guards', () => {
    test('an anonymous visitor is sent to the login page and returns after logging in', async ({
        page,
    }) => {
        await page.goto('/reading-list');
        await expect(page).toHaveURL(/\/login$/);

        // Create the account in a second step, then come back to the protected address.
        const email = await register(page, 'Guard Tester');
        await logout(page);

        await page.goto('/reading-list');
        await expect(page).toHaveURL(/\/login$/);
        // Log in on the page the guard redirected to, so the app can send the user back.
        await loginAndWait(page, email, PASSWORD, { openPage: false });
        await expect(page).toHaveURL(/\/reading-list$/);
        await expect(page.getByRole('heading', { name: 'Mijn leeslijst' })).toBeVisible();
    });

    test('a wrong password shows an error message and keeps the user on the login page', async ({
        page,
    }) => {
        const email = await register(page, 'Wrong Password');
        await logout(page);

        await login(page, email, 'not-the-password');
        await expect(page.getByRole('alert')).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
    });

    test('a registration with a too short password is blocked by the form', async ({ page }) => {
        await page.goto('/register');
        await page.getByLabel('Naam').fill('Short Password');
        await page.getByLabel('E-mail').fill(uniqueEmail());
        await page.getByLabel('Wachtwoord').fill('short');
        await page.getByRole('button', { name: 'Registreren' }).click();
        await expect(page).toHaveURL(/\/register$/);
    });

    test('a student cannot open the teacher pages by typing the address', async ({ page }) => {
        await register(page, 'Student Guard');
        await page.goto('/students');
        // No previous page in the app, so the guard sends the student to the home page.
        await expect(page).toHaveURL('/');
        await expect(page.getByRole('heading', { name: 'Jouw leerlingen' })).toHaveCount(0);
    });

    test('an unknown address shows the not found page with a way back', async ({ page }) => {
        await register(page, 'Lost Student');
        await page.goto('/this-page-does-not-exist');
        await expect(page.getByRole('heading', { name: 'Pagina niet gevonden' })).toBeVisible();
        await page.getByRole('link', { name: 'Terug naar de catalogus' }).click();
        await expect(page).toHaveURL('/');
    });
});
