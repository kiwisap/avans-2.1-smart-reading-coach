import { expect, test } from '@playwright/test';
import { PASSWORD, loginAndWait, logout, openSettings, register } from './helpers.ts';

// The settings panel opens from the name in the menu.
test.describe('settings', () => {
    test('a student changes the name and the password', async ({ page }) => {
        const email = await register(page, `Settings Student ${Date.now()}`);

        let panel = await openSettings(page);
        // The profile game was skipped, so Bo invites the student to fill it in.
        await expect(panel.getByRole('button', { name: 'Invullen met Bo' })).toBeVisible();

        await panel.getByText('Naam', { exact: true }).click();
        const newName = `Renamed ${Date.now()}`;
        await panel.getByLabel('Naam').fill(newName);
        await panel.getByRole('button', { name: 'Naam opslaan' }).click();
        await expect(panel.getByText('Je naam is aangepast.')).toBeVisible();
        await panel.getByRole('button', { name: 'Instellingen sluiten' }).click();
        await expect(
            page.getByRole('button', { name: `Instellingen van ${newName} openen` }),
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
        await register(page, `Email Student ${Date.now()}`);
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
});
