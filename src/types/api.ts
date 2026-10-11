// Types for the data the backend API sends and receives.
// They are generated from the OpenAPI document of the backend (npm run api:types), so the
// frontend follows the API contract. Change the API, regenerate, and the compiler shows what to fix.
import type { components } from '../api/schema';

type Schemas = components['schemas'];

export type Role = Schemas['Role'];
export type LanguageLevel = Schemas['LanguageLevel'];
export type MaterialType = Schemas['MaterialType'];
export type DesiredLength = Schemas['DesiredLength'];
export type ReadingGoal = Schemas['ReadingGoal'];
export type ReadingStatus = Schemas['ReadingStatus'];
export type User = Schemas['User'];
export type AuthResponse = Schemas['AuthResponse'];
export type Book = Schemas['Book'];
export type Suggestion = Schemas['Suggestion'];
export type BookPage = Schemas['BookPage'];
export type BookFacets = Schemas['BookFacets'];
export type ProfileInput = Schemas['ProfileInput'];
export type ReadingProfile = Schemas['ReadingProfile'];
export type ProfileOptions = Schemas['ProfileOptions'];
export type ReadingListItem = Schemas['ReadingListItem'];
export type TeacherLink = Schemas['TeacherLink'];
export type StudentSummary = Schemas['StudentSummary'];
export type StudentOverview = Schemas['StudentOverview'];
