import { expect, type Page } from '@playwright/test';

export const PASSWORD = 'E2e-Password1!';

// A new address for every call, so tests never depend on each other or on earlier runs.
export function uniqueEmail(prefix = 'student'): string {
    const random = Math.random().toString(36).slice(2, 8);
    return `${prefix}.${Date.now()}.${random}@e2e.test`;
}

export async function register(
    page: Page,
    name: string,
    email = uniqueEmail(),
    { skipOnboarding = true } = {},
) {
    await page.goto('/register');
    // The name in parts: the first word is the first name, the rest the last name.
    const [firstName = name, ...rest] = name.split(' ');
    await page.getByLabel('Voornaam').fill(firstName);
    await page.getByLabel('Achternaam').fill(rest.join(' ') || 'Student');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Wachtwoord').fill(PASSWORD);
    await page.getByRole('button', { name: 'Registreren' }).click();
    // After registering the app starts the reading profile game. Most tests skip it and go on
    // to the catalogue; onboarding.spec.ts plays it.
    await expect(page).toHaveURL('/welcome');
    if (skipOnboarding) {
        await page.getByRole('button', { name: 'Later invullen' }).click();
        await expect(page).toHaveURL('/');
    }
    return email;
}

// Logs in through the form. By default it opens the login page first; pass openPage false when
// the test is already on the login page (for example after a redirect from a protected page).
// Resolves when the session is stored, so the next navigation does not cancel the login request.
export async function loginAndWait(
    page: Page,
    email: string,
    password: string,
    { openPage = true } = {},
) {
    if (openPage) await page.goto('/login');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Wachtwoord').fill(password);
    await page.getByRole('button', { name: 'Inloggen' }).click();
    await page.waitForFunction(() => localStorage.getItem('src_token') !== null);
}

export async function login(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Wachtwoord').fill(password);
    await page.getByRole('button', { name: 'Inloggen' }).click();
}

// Opens a page through the menu. On a phone the menu is collapsed behind the toggle button.
export async function openFromMenu(page: Page, linkName: string) {
    const toggle = page.getByRole('button', { name: 'Menu in- of uitklappen' });
    if (await toggle.isVisible()) await toggle.click();
    await page
        .getByRole('navigation', { name: 'Hoofdmenu' })
        .getByRole('link', { name: linkName })
        .click();
}

// Opens the settings panel through the name in the menu.
export async function openSettings(page: Page) {
    const toggle = page.getByRole('button', { name: 'Menu in- of uitklappen' });
    if (await toggle.isVisible()) await toggle.click();
    await page.getByRole('button', { name: /^Instellingen van .+ openen$/ }).click();
    const panel = page.getByRole('dialog');
    await expect(panel).toBeVisible();
    return panel;
}

export async function logout(page: Page) {
    const panel = await openSettings(page);
    await panel.getByRole('button', { name: 'Uitloggen' }).click();
    await expect(page).toHaveURL(/\/login$/);
}

// Fills in the reading profile form with a valid answer for every question and saves it.
export async function fillAndSaveProfile(page: Page) {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Mijn leesprofiel' })).toBeVisible();

    await page
        .getByRole('group', { name: /Wat is je leesniveau/ })
        .getByLabel('3F', { exact: true })
        .check();

    // All material types, so the advice has enough titles to choose from.
    const types = page.getByRole('group', { name: /Wat voor soort teksten/ }).getByRole('checkbox');
    for (const box of await types.all()) await box.check();

    // Topics come from the imported catalogue, so pick the first ones instead of fixed names.
    const topics = page.getByRole('group', { name: /Welke onderwerpen/ }).getByRole('checkbox');
    await expect(topics.first()).toBeVisible();
    await topics.nth(0).check();
    await topics.nth(1).check();

    await page.getByLabel(/Middel/).check();
    await page.getByLabel('Voor mijn plezier').check();

    await page.getByRole('button', { name: 'Profiel opslaan' }).click();
    await expect(
        page.getByRole('status').filter({ hasText: 'Je leesprofiel is opgeslagen' }),
    ).toBeVisible();
}

// A teacher searches a student by name and links themselves to them from the students page.
export async function linkStudentAsTeacher(page: Page, studentName: string) {
    await page.goto('/students');
    await page.getByRole('button', { name: 'Leerling koppelen' }).click();
    const dialog = page.getByRole('dialog', { name: 'Leerling koppelen' });
    await dialog.getByLabel('Zoek op naam of e-mailadres').fill(studentName);
    await dialog.getByRole('button', { name: `Koppel jezelf aan ${studentName}` }).click();
    await expect(dialog.getByText(`Je bent nu gekoppeld aan ${studentName}.`)).toBeVisible();
    await dialog.getByRole('button', { name: 'Klaar' }).click();
    await expect(page.getByRole('link', { name: studentName })).toBeVisible();
}
