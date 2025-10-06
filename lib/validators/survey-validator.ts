/**
 * Multi-Page Survey Validation Schema
 *
 * Supports Typeform-like surveys with pages instead of flat field lists.
 */

import { z } from 'zod';

/**
 * Base schema for all survey pages
 */
const SurveyPageBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
});

/**
 * Text Input Page Schema
 * For free-form text responses
 */
export const TextInputPageSchema = SurveyPageBaseSchema.extend({
  type: z.literal('textInput'),
  placeholder: z.string().optional(),
  rows: z.number().min(1).max(20).default(3),
  validation: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
});

/**
 * Multiple Choice Option Schema
 * Supports follow-up questions for selected options
 */
const MultipleChoiceOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  followUpQuestion: z.string().optional(),
});

/**
 * Multiple Choice Page Schema
 * Grid layout with checkboxes
 */
export const MultipleChoicePageSchema = SurveyPageBaseSchema.extend({
  type: z.literal('multipleChoice'),
  options: z.array(MultipleChoiceOptionSchema).min(1),
  allowMultiple: z.boolean().default(true),
  allowUserOptions: z.boolean().default(false),
  maxSelections: z.number().optional(),
});

/**
 * Rating Page Schema
 * Star/number rating system
 */
export const RatingPageSchema = SurveyPageBaseSchema.extend({
  type: z.literal('rating'),
  min: z.number().default(1),
  max: z.number().min(2).max(10).default(5),
  labels: z.object({
    min: z.string().optional(),
    max: z.string().optional(),
  }).optional(),
});

/**
 * Discriminated union of all page types
 */
export const SurveyPageSchema = z.discriminatedUnion('type', [
  TextInputPageSchema,
  MultipleChoicePageSchema,
  RatingPageSchema,
]);

/**
 * Complete Multi-Page Survey Schema
 */
export const MultiPageSurveySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  pages: z.array(SurveyPageSchema).min(1),
  trigger: z.enum(['conversation_start', 'message_received', 'manual', 'condition_met']),
  styling: z.object({
    theme: z.enum(['default', 'minimal', 'gradient']).default('default'),
    primaryColor: z.string().optional(),
    showProgress: z.boolean().default(true),
  }).optional(),
});

export type MultipleChoiceOption = z.infer<typeof MultipleChoiceOptionSchema>;
export type TextInputPage = z.infer<typeof TextInputPageSchema>;
export type MultipleChoicePage = z.infer<typeof MultipleChoicePageSchema>;
export type RatingPage = z.infer<typeof RatingPageSchema>;
export type SurveyPage = z.infer<typeof SurveyPageSchema>;
export type MultiPageSurvey = z.infer<typeof MultiPageSurveySchema>;

/**
 * Validation function for multi-page surveys
 */
export function validateMultiPageSurvey(data: unknown) {
  return MultiPageSurveySchema.safeParse(data);
}

/**
 * Check if a survey uses the multi-page format
 */
export function isMultiPageSurvey(survey: any): boolean {
  return Array.isArray(survey.pages) && survey.pages.length > 0;
}
