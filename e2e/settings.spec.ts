import { expect, test } from '@playwright/test';
import {
    PASSWORD,
    login,
    loginAndWait,
    logout,
    mailLink,
    openAccountSettings,
    openSettings,
    register,
} from './helpers.ts';

// The settings panel opens from the name in the menu.
test.describe('settings', () => {
    test('a student changes the name and the password', async ({ page }) => {
        const email = await register(page, `Settings Student${Date.now()}`);

        const panel = await openSettings(page);
        // The profile game was skipped, so Bo invites the student to fill it in.
        await expect(panel.getByRole('button', { name: 'Invullen met Bo' })).toBeVisible();
        // Bo explains that it is an AI, behind a fold.
        await expect(panel.getByText('Bo is een AI')).toBeHidden();
        await panel.getByText('Over Bo', { exact: true }).click();
        await expect(panel.getByText('Bo is een AI')).toBeVisible();
        // About the app is a small footer that is always there.
        await expect(panel.locator('footer')).toContainText('Smart Reading Coach');

        // The settings slide over the profile, and back.
        await panel.getByRole('button', { name: /^Instellingen Naam/ }).click();
        let settings = panel.getByRole('region', { name: 'Instellingen' });
        await expect(settings).toBeVisible();
        await settings.getByRole('button', { name: 'Terug naar je profiel' }).click();
        await expect(settings).toBeHidden();
        await expect(panel.getByRole('button', { name: /^Instellingen Naam/ })).toBeFocused();
        await panel.getByRole('button', { name: /^Instellingen Naam/ }).click();

        await settings.getByText('Naam', { exact: true }).click();
        const lastName = `Berg${Date.now()}`;
        await settings.getByLabel('Voornaam').fill('Sanne');
        await settings.getByLabel('Tussenvoegsel').fill('van der');
        await settings.getByLabel('Achternaam').fill(lastName);
        await settings.getByRole('button', { name: 'Naam opslaan' }).click();
        await expect(settings.getByText('Je naam is aangepast.')).toBeVisible();
        await settings.getByRole('button', { name: 'Instellingen sluiten' }).click();
        await expect(
            page.getByRole('button', { name: `Instellingen van Sanne van der ${lastName} openen` }),
        ).toBeVisible();

        settings = await openAccountSettings(page);
        await settings.getByText('Wachtwoord', { exact: true }).click();
        await settings.locator('details[open]').getByLabel('Huidig wachtwoord').fill(PASSWORD);
        await settings.getByLabel(/^Nieuw wachtwoord/).fill('Nieuw-Wachtwoord1');
        await settings.getByLabel('Herhaal je nieuwe wachtwoord').fill('Nieuw-Wachtwoord1');
        await settings.getByRole('button', { name: 'Wachtwoord wijzigen' }).click();
        await expect(settings.getByText('Je wachtwoord is gewijzigd.')).toBeVisible();
        await settings.getByRole('button', { name: 'Instellingen sluiten' }).click();

        await logout(page);
        await loginAndWait(page, email, 'Nieuw-Wachtwoord1');
        await expect(page).toHaveURL('/');
    });

    test('a new email address needs the current password', async ({ page }) => {
        await register(page, `Email Student${Date.now()}`);
        const panel = await openAccountSettings(page);
        await panel.getByText('E-mailadres', { exact: true }).click();
        await panel.getByLabel('Nieuw e-mailadres').fill(`changed.${Date.now()}@e2e.test`);
        await panel
            .locator('details[open]')
            .getByLabel('Huidig wachtwoord')
            .fill('not-my-password');
        await panel.getByRole('button', { name: 'E-mailadres opslaan' }).click();
        await expect(panel.getByRole('alert')).toContainText('Je huidige wachtwoord klopt niet');
    });

    test('a new email address counts only after clicking the link sent to it', async ({ page }) => {
        const email = await register(page, `Change Mail${Date.now()}`);
        const newEmail = `new.${Date.now()}@e2e.test`;
        let settings = await openAccountSettings(page);
        await settings.getByText('E-mailadres', { exact: true }).click();
        await settings.getByLabel('Nieuw e-mailadres').fill(newEmail);
        await settings.locator('details[open]').getByLabel('Huidig wachtwoord').fill(PASSWORD);
        await settings.getByRole('button', { name: 'E-mailadres opslaan' }).click();
        await expect(settings.getByRole('status')).toContainText(`link gestuurd naar ${newEmail}`);
        await expect(settings.getByText(email, { exact: false }).first()).toBeVisible();
        await settings.getByRole('button', { name: 'Instellingen sluiten' }).click();

        await page.goto(await mailLink(page, newEmail, '/confirm-email'));
        await expect(page.getByText(`Je e-mailadres is nu ${newEmail}`)).toBeVisible();
        settings = await openAccountSettings(page);
        await expect(settings.getByText(newEmail).first()).toBeVisible();
    });

    test('a student removes the account after typing the confirmation', async ({ page }) => {
        const email = await register(page, `Delete Student${Date.now()}`);
        const panel = await openAccountSettings(page);
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
