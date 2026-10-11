import { expect, test } from '@playwright/test';
import { fillAndSaveProfile, loginAndWait, logout, register } from './helpers.ts';

// The teacher account comes from the seed script (npm run db:seed in the API repo).
const TEACHER_EMAIL = process.env.E2E_TEACHER_EMAIL ?? 'teacher@example.com';
const TEACHER_PASSWORD = process.env.E2E_TEACHER_PASSWORD ?? 'Password123!';
const TEACHER_NAME = process.env.E2E_TEACHER_NAME ?? 'Demo Teacher';

// Risk: a teacher must only see students who linked themselves, and a student only their own data.
test.describe('teacher view', () => {
    test('a teacher sees the profile of a student who linked to them', async ({
        page,
        browser,
    }) => {
        const studentName = `Linked Student ${Date.now()}`;
        await register(page, studentName);
        await fillAndSaveProfile(page);

        await page.goto('/teachers');
        await page.getByRole('button', { name: `Koppel aan ${TEACHER_NAME}` }).click();
        await expect(
            page
                .getByRole('status')
                .filter({ hasText: `Je bent nu gekoppeld aan ${TEACHER_NAME}` }),
        ).toBeVisible();
        await logout(page);

        // The teacher uses a separate browser session.
        const teacherContext = await browser.newContext();
        const teacherPage = await teacherContext.newPage();
        await loginAndWait(teacherPage, TEACHER_EMAIL, TEACHER_PASSWORD);
        await expect(teacherPage).toHaveURL('/');

        await teacherPage.goto('/students');
        await teacherPage.getByRole('link', { name: studentName }).click();
        await expect(teacherPage).toHaveURL(/\/students\/.+/);
        await expect(teacherPage.getByRole('heading', { name: 'Leesprofiel' })).toBeVisible();
        await expect(teacherPage.getByText('nog geen leesprofiel ingevuld')).toHaveCount(0);

        // A teacher has no student pages such as the reading profile form.
        await teacherPage.goto('/profile');
        await expect(teacherPage).toHaveURL('/');
        await teacherContext.close();
    });

    test('a student who did not link is not visible to the teacher', async ({ page, browser }) => {
        const studentName = `Unlinked Student ${Date.now()}`;
        await register(page, studentName);

        const teacherContext = await browser.newContext();
        const teacherPage = await teacherContext.newPage();
        await loginAndWait(teacherPage, TEACHER_EMAIL, TEACHER_PASSWORD);
        await teacherPage.goto('/students');
        await expect(teacherPage.getByRole('heading', { name: 'Jouw leerlingen' })).toBeVisible();
        await expect(teacherPage.getByRole('link', { name: studentName })).toHaveCount(0);
        await teacherContext.close();
    });
});
