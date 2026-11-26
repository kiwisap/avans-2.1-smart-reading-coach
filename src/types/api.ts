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
export type AdviceSource = Schemas['AdviceSource'];
export type Advice = Schemas['Advice'];
export type BookPage = Schemas['BookPage'];
export type BookFacets = Schemas['BookFacets'];
export type ProfileInput = Schemas['ProfileInput'];
export type ReadingProfile = Schemas['ReadingProfile'];
export type ProfileOptions = Schemas['ProfileOptions'];
export type ReadingListItem = Schemas['ReadingListItem'];
export type ReadingListSource = Schemas['ReadingListSource'];
export type Progress = Schemas['Progress'];
export type Badge = Schemas['Badge'];
export type BadgeId = Badge['id'];
export type AdviceStats = Schemas['AdviceStats'];
export type SourceCount = Schemas['SourceCount'];
export type AdviceSourceStats = Schemas['AdviceSourceStats'];
export type LinkedTeacher = Schemas['LinkedTeacher'];
export type StudentLink = Schemas['StudentLink'];
export type StudentSummary = Schemas['StudentSummary'];
export type StudentOverview = Schemas['StudentOverview'];
