import { z } from 'zod';
import { ProductCardSchema } from './product-card-validator';
import { SurveyPageSchema } from './survey-validator';

// Define missing types that were previously imported from '../types'
type AgentSchema = z.ZodObject<{
  name: z.ZodString;
  description: z.ZodString;
  model: z.ZodString;
  temperature: z.ZodOptional<z.ZodNumber>;
  maxTokens: z.ZodOptional<z.ZodNumber>;
  topP: z.ZodOptional<z.ZodNumber>;
  frequencyPenalty: z.ZodOptional<z.ZodNumber>;
  presencePenalty: z.ZodOptional<z.ZodNumber>;
  stop: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
}>;

type Survey = z.ZodObject<{
  id: z.ZodString;
  title: z.ZodString;
  description: z.ZodOptional<z.ZodString>;
  fields: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodOptional<z.ZodBoolean>;
    placeholder: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
  }>, 'many'>;
}>;

type Visualization = z.ZodObject<{
  id: z.ZodString;
  type: z.ZodString;
  title: z.ZodString;
  description: z.ZodOptional<z.ZodString>;
  data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
  options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}>;

type LifecycleHooks = z.ZodObject<{
  onConversationStart: z.ZodArray<z.ZodObject<{
    action: z.ZodString;
    target: z.ZodString;
    condition: z.ZodOptional<z.ZodString>;
  }>, 'many'>;
  onConversationEnd: z.ZodArray<z.ZodObject<{
    action: z.ZodString;
    target: z.ZodString;
    condition: z.ZodOptional<z.ZodString>;
  }>, 'many'>;
}>;

/**
 * Simplified app config schema for MCP server
 * This is a subset of the full MCP-APP config focused on rendering capabilities
 */
export const AppConfigSchema = z.object({
  surveys: z.record(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    // Support both old format (fields) and new format (pages)
    fields: z.array(z.object({
      id: z.string(),
      type: z.enum([
        'text',
        'textarea',
        'email',
        'number',
        'multiple_choice',
        'single_choice',
        'rating',
        'date',
        'file'
      ]),
      label: z.string(),
      description: z.string().optional(),
      required: z.boolean().default(false),
      placeholder: z.string().optional(),
      options: z.array(z.string()).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      maxSelections: z.number().optional(),
      validation: z.object({
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        pattern: z.string().optional(),
        message: z.string().optional(),
      }).optional(),
    })).optional(),
    // New multi-page format
    pages: z.array(SurveyPageSchema).optional(),
    trigger: z.enum([
      'conversation_start',
      'message_received',
      'manual',
      'condition_met'
    ]),
    condition: z.string().optional(),
    // Optional styling for multi-page surveys
    styling: z.object({
      theme: z.enum(['default', 'minimal', 'gradient']).default('default'),
      primaryColor: z.string().optional(),
      showProgress: z.boolean().default(true),
    }).optional(),
  }).refine(
    (data) => {
      // Must have either fields or pages, but not both
      return (data.fields && !data.pages) || (!data.fields && data.pages);
    },
    { message: 'Survey must have either "fields" or "pages", but not both' }
  )).optional(),

  visualizations: z.record(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    type: z.enum(['chart', 'table', 'metrics', 'custom']),
    dataSource: z.string(),
    config: z.object({
      chartType: z.enum(['bar', 'line', 'pie', 'scatter', 'area']).optional(),
      xAxis: z.string().optional(),
      yAxis: z.string().optional(),
      colors: z.array(z.string()).optional(),
      metrics: z.array(z.object({
        label: z.string(),
        field: z.string(),
        format: z.string().optional(),
      })).optional(),
    }).optional(),
    trigger: z.enum([
      'survey_complete',
      'message_received',
      'manual',
      'condition_met'
    ]),
    condition: z.string().optional(),
  })).optional(),

  productCards: z.record(ProductCardSchema).optional(),

  lifecycle: z.object({
    onConversationStart: z.array(z.object({
      action: z.enum([
        'show_survey',
        'show_visualization',
        'show_product_card',
        'send_message',
        'show_modal',
        'save_data',
        'trigger_mcp_tool',
        'conditional_branch',
        'delay_action'
      ]),
      surveyId: z.string().optional(),
      visualizationId: z.string().optional(),
      productCardId: z.string().optional(),
      message: z.string().optional(),
      mcpTool: z.string().optional(),
      condition: z.string().optional(),
      delay: z.number().optional(),
      data: z.record(z.any()).optional(),
    })).optional(),
    onMessageReceived: z.array(z.object({
      action: z.enum([
        'show_survey',
        'show_visualization',
        'show_product_card',
        'send_message',
        'show_modal',
        'save_data',
        'trigger_mcp_tool',
        'conditional_branch',
        'delay_action'
      ]),
      surveyId: z.string().optional(),
      visualizationId: z.string().optional(),
      productCardId: z.string().optional(),
      message: z.string().optional(),
      mcpTool: z.string().optional(),
      condition: z.string().optional(),
      delay: z.number().optional(),
      data: z.record(z.any()).optional(),
    })).optional(),
    onSurveyComplete: z.array(z.object({
      action: z.enum([
        'show_survey',
        'show_visualization',
        'show_product_card',
        'send_message',
        'show_modal',
        'save_data',
        'trigger_mcp_tool',
        'conditional_branch',
        'delay_action'
      ]),
      surveyId: z.string().optional(),
      visualizationId: z.string().optional(),
      productCardId: z.string().optional(),
      message: z.string().optional(),
      mcpTool: z.string().optional(),
      condition: z.string().optional(),
      delay: z.number().optional(),
      data: z.record(z.any()).optional(),
    })).optional(),
    onVisualizationShown: z.array(z.object({
      action: z.enum([
        'show_survey',
        'show_visualization',
        'show_product_card',
        'send_message',
        'show_modal',
        'save_data',
        'trigger_mcp_tool',
        'conditional_branch',
        'delay_action'
      ]),
      surveyId: z.string().optional(),
      visualizationId: z.string().optional(),
      productCardId: z.string().optional(),
      message: z.string().optional(),
      mcpTool: z.string().optional(),
      condition: z.string().optional(),
      delay: z.number().optional(),
      data: z.record(z.any()).optional(),
    })).optional(),
    onCustomEvent: z.record(z.array(z.object({
      action: z.enum([
        'show_survey',
        'show_visualization',
        'show_product_card',
        'send_message',
        'show_modal',
        'save_data',
        'trigger_mcp_tool',
        'conditional_branch',
        'delay_action'
      ]),
      surveyId: z.string().optional(),
      visualizationId: z.string().optional(),
      productCardId: z.string().optional(),
      message: z.string().optional(),
      mcpTool: z.string().optional(),
      condition: z.string().optional(),
      delay: z.number().optional(),
      data: z.record(z.any()).optional(),
    }))).optional(),
  }).optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

export interface ValidationResult {
  success: boolean;
  data?: AppConfig;
  errors?: ValidationError[];
}

/**
 * Validates an app configuration against the schema
 */
export function validateConfig(config: unknown): ValidationResult {
  try {
    const validated = AppConfigSchema.parse(config);
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.map(String),
          message: err.message,
          code: err.code,
        })),
      };
    }

    return {
      success: false,
      errors: [{
        path: [],
        message: error instanceof Error ? error.message : 'Unknown validation error',
        code: 'UNKNOWN_ERROR',
      }],
    };
  }
}

/**
 * Validates and throws on error (for use in tools)
 */
export function validateConfigOrThrow(config: unknown): AppConfig {
  const result = validateConfig(config);

  if (!result.success) {
    const errorMessages = result.errors?.map(err =>
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    throw new Error(`Invalid configuration: ${errorMessages}`);
  }

  return result.data!;
}
