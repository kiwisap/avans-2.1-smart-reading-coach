import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { fillAndSaveProfile, loginAndWait, logout, register } from './helpers.ts';

// Automated WCAG check with axe-core on every page of the app. Axe finds about a third of all
// accessibility problems (contrast, names, roles, landmarks, labels). The rest, such as a
// logical focus order and screen reader wording, is checked by hand: see docs/accessibility.md.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const TEACHER_EMAIL = process.env.E2E_TEACHER_EMAIL ?? 'teacher@example.com';
const TEACHER_PASSWORD = process.env.E2E_TEACHER_PASSWORD ?? 'Password123!';
const TEACHER_NAME = process.env.E2E_TEACHER_NAME ?? 'Demo Teacher';

// Fails with a readable list: rule, impact, how to fix and the elements concerned.
async function expectNoViolations(page: Page, label: string) {
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const report = violations.map((violation) => {
        const targets = violation.nodes.map((node) => `    ${node.target.join(' ')}`).join('\n');
        return `[${violation.impact}] ${violation.id}: ${violation.help}\n  ${violation.helpUrl}\n${targets}`;
    });
    expect(report, `Accessibility problems on ${label}:\n${report.join('\n')}`).toEqual([]);
}

test.describe('accessibility (WCAG 2.1 A and AA)', () => {
    test('public pages', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: 'Inloggen', level: 1 })).toBeVisible();
        await expectNoViolations(page, 'login');

        await page.goto('/register');
        await expect(page.getByRole('heading', { name: 'Account aanmaken' })).toBeVisible();
        await expectNoViolations(page, 'register');

        await page.goto('/this-page-does-not-exist');
        await expect(page.getByRole('heading', { name: 'Pagina niet gevonden' })).toBeVisible();
        await expectNoViolations(page, 'not found');
    });

    test('student pages', async ({ page }) => {
        await register(page, 'Axe Student');

        await expect(page.getByRole('article').first()).toBeVisible();
        await expectNoViolations(page, 'catalogue');

        // The empty profile form, with its error summary after a failed submit.
        await page.goto('/profile');
        await expect(page.getByRole('button', { name: 'Profiel opslaan' })).toBeVisible();
        await expectNoViolations(page, 'profile form');
        await page.getByRole('button', { name: 'Profiel opslaan' }).click();
        await expect(
            page.getByRole('alert').filter({ hasText: 'Pas het volgende aan' }),
        ).toBeVisible();
        await expectNoViolations(page, 'profile form with errors');

        await fillAndSaveProfile(page);
        await expect(page.getByRole('button', { name: 'Profiel bewerken' })).toBeVisible();
        await expectNoViolations(page, 'profile summary');

        // The discard dialog is a native dialog that traps focus.
        await page.getByRole('button', { name: 'Profiel bewerken' }).click();
        await page.getByLabel('Om iets nieuws te leren').check();
        await page.getByRole('button', { name: 'Annuleren' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expectNoViolations(page, 'discard dialog');
        await page.getByRole('button', { name: 'Verder bewerken' }).click();
        await page.getByRole('button', { name: 'Annuleren' }).click();
        await page.getByRole('button', { name: 'Wijzigingen weggooien' }).click();

        await page.goto('/advice');
        await expect(page.getByRole('article').first()).toBeVisible();
        await expectNoViolations(page, 'advice');

        await page
            .getByRole('button', { name: /Voeg .* toe aan je leeslijst/ })
            .first()
            .click();
        await page.goto('/reading-list');
        await expect(page.getByRole('article').first()).toBeVisible();
        await expectNoViolations(page, 'reading list');

        await page.goto('/teachers');
        await expect(page.getByRole('heading', { name: 'Mijn docenten' })).toBeVisible();
        await expect(
            page.getByRole('button', { name: `Koppel aan ${TEACHER_NAME}` }),
        ).toBeVisible();
        await expectNoViolations(page, 'teachers');
    });

    test('teacher pages', async ({ page, browser }) => {
        // A linked student with a profile, so the teacher pages show real content.
        const studentName = `Axe Linked ${Date.now()}`;
        await register(page, studentName);
        await fillAndSaveProfile(page);
        await page.goto('/teachers');
        await page.getByRole('button', { name: `Koppel aan ${TEACHER_NAME}` }).click();
        await expect(page.getByText(`Je bent nu gekoppeld aan ${TEACHER_NAME}`)).toBeVisible();
        await logout(page);

        const context = await browser.newContext();
        const teacherPage = await context.newPage();
        await loginAndWait(teacherPage, TEACHER_EMAIL, TEACHER_PASSWORD);

        await teacherPage.goto('/students');
        await expect(teacherPage.getByRole('link', { name: studentName })).toBeVisible();
        await expectNoViolations(teacherPage, 'students');

        await teacherPage.getByRole('link', { name: studentName }).click();
        await expect(teacherPage.getByRole('heading', { name: 'Leesprofiel' })).toBeVisible();
        await expectNoViolations(teacherPage, 'student detail');
        await context.close();
    });
});
