// Types for the data the backend API sends and receives.
export type Role = 'student' | 'teacher';
export type LanguageLevel = '2F' | '3F' | '3F+';
export type MaterialType =
    'boek' | 'online-artikel' | 'blogpost' | 'dichtbundel' | 'tijdschrift' | 'krant';
export type DesiredLength = 'short' | 'medium' | 'long';
export type ReadingGoal = 'enjoyment' | 'learn' | 'language' | 'work';
export type ReadingStatus = 'unread' | 'read';

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Book {
    id: string;
    title: string;
    author: string | null;
    type: MaterialType;
    genre: string | null;
    format: string | null;
    description: string | null;
    themes: string[];
    levels: LanguageLevel[];
    levelLabel: string | null;
    url: string | null;
}

export interface Suggestion extends Book {
    motivation: string;
}

export interface BookPage {
    items: Book[];
    total: number;
    page: number;
    limit: number;
}

export interface BookFacets {
    types: string[];
    levels: string[];
    themes: string[];
}

// What a student answers in the reading profile.
export interface ProfileInput {
    languageLevel: LanguageLevel;
    materialTypes: MaterialType[];
    topics: string[];
    desiredLength: DesiredLength;
    readingGoal: ReadingGoal;
}

export interface ReadingProfile extends ProfileInput {
    updatedAt: string;
}

export interface ProfileOptions {
    languageLevels: LanguageLevel[];
    materialTypes: MaterialType[];
    desiredLengths: DesiredLength[];
    readingGoals: ReadingGoal[];
    maxTopics: number;
    topics: string[];
}

export interface ReadingListItem {
    id: string;
    bookId: string;
    status: ReadingStatus;
    addedAt: string;
    readAt: string | null;
    book: Book | null; // null when the title was removed from the catalog
}

export interface TeacherLink {
    id: string;
    name: string;
    linked: boolean;
}

export interface StudentSummary {
    id: string;
    name: string;
    email: string;
    hasProfile: boolean;
}

export interface StudentOverview {
    student: { id: string; name: string; email: string };
    profile: ReadingProfile | null;
    readingList: ReadingListItem[];
}
