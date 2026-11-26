import { expect, test } from '@playwright/test';
import {
    fillAndSaveProfile,
    linkStudentAsTeacher,
    loginAndWait,
    openSettings,
    register,
} from './helpers.ts';

// The teacher account comes from the seed script (npm run db:seed in the API repo).
const TEACHER_EMAIL = process.env.E2E_TEACHER_EMAIL ?? 'teacher@example.com';
const TEACHER_PASSWORD = process.env.E2E_TEACHER_PASSWORD ?? 'Password123!';
const TEACHER_NAME = process.env.E2E_TEACHER_NAME ?? 'Demo Teacher';

// Risk: a teacher must only see students they linked themselves to, and a student only their own data.
test.describe('teacher view', () => {
    test('a teacher links to a student and sees their profile, the student sees the teacher', async ({
        page,
        browser,
    }) => {
        const studentName = `Linked Student ${Date.now()}`;
        await register(page, studentName);
        await fillAndSaveProfile(page);

        // Before linking, the student has no teachers.
        let panel = await openSettings(page);
        await panel.getByRole('button', { name: 'Bekijk mijn docenten' }).click();
        let teachers = page.getByRole('dialog', { name: 'Mijn docenten' });
        await expect(teachers.getByText('nog geen docent aan je gekoppeld')).toBeVisible();
        await teachers.getByRole('button', { name: 'Sluiten' }).click();
        await panel.getByRole('button', { name: 'Instellingen sluiten' }).click();

        // The teacher uses a separate browser session.
        const teacherContext = await browser.newContext();
        const teacherPage = await teacherContext.newPage();
        await loginAndWait(teacherPage, TEACHER_EMAIL, TEACHER_PASSWORD);
        await expect(teacherPage).toHaveURL('/');
        await linkStudentAsTeacher(teacherPage, studentName);

        await teacherPage.getByRole('link', { name: studentName }).click();
        await expect(teacherPage).toHaveURL(/\/students\/.+/);
        await expect(teacherPage.getByRole('heading', { name: 'Leesprofiel' })).toBeVisible();
        await expect(teacherPage.getByText('nog geen leesprofiel ingevuld')).toHaveCount(0);

        // A teacher has no student pages such as the reading profile form.
        await teacherPage.goto('/profile');
        await expect(teacherPage).toHaveURL('/');
        await teacherContext.close();

        // Now the student sees the teacher, but cannot change the link.
        panel = await openSettings(page);
        await panel.getByRole('button', { name: 'Bekijk mijn docenten' }).click();
        teachers = page.getByRole('dialog', { name: 'Mijn docenten' });
        await expect(teachers.getByText(TEACHER_NAME)).toBeVisible();
        await expect(teachers.getByRole('button', { name: /koppel/i })).toHaveCount(0);

        // The old page where students linked themselves is gone.
        await page.goto('/teachers');
        await expect(page.getByRole('heading', { name: 'Mijn docenten' })).toHaveCount(0);
    });

    test('a student the teacher did not link is not visible to the teacher', async ({
        page,
        browser,
    }) => {
        const studentName = `Unlinked Student ${Date.now()}`;
        await register(page, studentName);

        const teacherContext = await browser.newContext();
        const teacherPage = await teacherContext.newPage();
        await loginAndWait(teacherPage, TEACHER_EMAIL, TEACHER_PASSWORD);
        await teacherPage.goto('/students');
        await expect(teacherPage.getByRole('heading', { name: 'Jouw leerlingen' })).toBeVisible();
        await expect(teacherPage.getByRole('link', { name: studentName })).toHaveCount(0);

        // Searching finds the student, but only linking makes them part of the list.
        await teacherPage.getByRole('button', { name: 'Leerling koppelen' }).click();
        const dialog = teacherPage.getByRole('dialog', { name: 'Leerling koppelen' });
        await dialog.getByLabel('Zoek op naam of e-mailadres').fill(studentName);
        await expect(
            dialog.getByRole('button', { name: `Koppel jezelf aan ${studentName}` }),
        ).toBeVisible();
        await dialog.getByRole('button', { name: 'Klaar' }).click();
        await expect(teacherPage.getByRole('link', { name: studentName })).toHaveCount(0);
        await teacherContext.close();
    });
});
