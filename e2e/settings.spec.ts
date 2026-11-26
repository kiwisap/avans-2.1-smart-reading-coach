import { expect, test } from '@playwright/test';
import { PASSWORD, login, loginAndWait, logout, openSettings, register } from './helpers.ts';

// The settings panel opens from the name in the menu.
test.describe('settings', () => {
    test('a student changes the name and the password', async ({ page }) => {
        const email = await register(page, `Settings Student${Date.now()}`);

        let panel = await openSettings(page);
        // The profile game was skipped, so Bo invites the student to fill it in.
        await expect(panel.getByRole('button', { name: 'Invullen met Bo' })).toBeVisible();
        // Bo explains that it is an AI, behind a fold.
        await expect(panel.getByText('Bo is een AI')).toBeHidden();
        await panel.getByText('Over Bo', { exact: true }).click();
        await expect(panel.getByText('Bo is een AI')).toBeVisible();

        await panel.getByText('Naam', { exact: true }).click();
        const lastName = `Berg${Date.now()}`;
        await panel.getByLabel('Voornaam').fill('Sanne');
        await panel.getByLabel('Tussenvoegsel').fill('van der');
        await panel.getByLabel('Achternaam').fill(lastName);
        await panel.getByRole('button', { name: 'Naam opslaan' }).click();
        await expect(panel.getByText('Je naam is aangepast.')).toBeVisible();
        await panel.getByRole('button', { name: 'Instellingen sluiten' }).click();
        await expect(
            page.getByRole('button', { name: `Instellingen van Sanne van der ${lastName} openen` }),
        ).toBeVisible();

        panel = await openSettings(page);
        await panel.getByText('Wachtwoord', { exact: true }).click();
        await panel.locator('details[open]').getByLabel('Huidig wachtwoord').fill(PASSWORD);
        await panel.getByLabel('Nieuw wachtwoord', { exact: true }).fill('Nieuw-Wachtwoord1');
        await panel.getByLabel('Herhaal je nieuwe wachtwoord').fill('Nieuw-Wachtwoord1');
        await panel.getByRole('button', { name: 'Wachtwoord wijzigen' }).click();
        await expect(panel.getByText('Je wachtwoord is gewijzigd.')).toBeVisible();
        await panel.getByRole('button', { name: 'Instellingen sluiten' }).click();

        await logout(page);
        await loginAndWait(page, email, 'Nieuw-Wachtwoord1');
        await expect(page).toHaveURL('/');
    });

    test('a new email address needs the current password', async ({ page }) => {
        await register(page, `Email Student${Date.now()}`);
        const panel = await openSettings(page);
        await panel.getByText('E-mailadres', { exact: true }).click();
        await panel.getByLabel('Nieuw e-mailadres').fill(`changed.${Date.now()}@e2e.test`);
        await panel
            .locator('details[open]')
            .getByLabel('Huidig wachtwoord')
            .fill('not-my-password');
        await panel.getByRole('button', { name: 'E-mailadres opslaan' }).click();
        await expect(panel.getByRole('alert')).toContainText('Je huidige wachtwoord klopt niet');
    });

    test('a student removes the account after typing the confirmation', async ({ page }) => {
        const email = await register(page, `Delete Student${Date.now()}`);
        const panel = await openSettings(page);
        await panel.getByRole('button', { name: 'Account verwijderen' }).click();

        const confirm = page.getByRole('dialog', { name: 'Weet je het zeker?' });
        await expect(confirm.getByText('Dit kun je niet ongedaan maken')).toBeVisible();
        const remove = confirm.getByRole('button', { name: 'Account definitief verwijderen' });
        await expect(remove).toBeDisabled();

        await confirm.getByLabel('Typ VERWIJDEREN om te bevestigen').fill('VERWIJDEREN');
        await confirm.getByLabel('Je wachtwoord').fill(PASSWORD);
        await remove.click();

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByText('Je account is verwijderd')).toBeVisible();

        // The account no longer exists.
        await login(page, email, PASSWORD);
        await expect(page.getByRole('alert')).toContainText('Onjuist e-mailadres of wachtwoord');
    });
});
