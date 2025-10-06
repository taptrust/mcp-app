import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

/**
 * AI Provider Configuration for MCP-APP
 *
 * Configures the AI provider based on environment variables
 */

export function getAIProvider() {
  // Check for OpenAI API key
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: openai,
      model: process.env.AI_MODEL || 'gpt-4',
      baseURL: process.env.AI_BASE_URL
    };
  }

  // Check for Anthropic API key
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: anthropic,
      model: process.env.AI_MODEL || 'claude-3-sonnet-20240229',
      baseURL: process.env.AI_BASE_URL
    };
  }

  // Check for Google Gemini API key
  if (process.env.GEMINI_API_KEY) {
    return {
      provider: google,
      model: process.env.AI_MODEL || 'gemini-pro',
      baseURL: process.env.AI_BASE_URL
    };
  }

  throw new Error(
    'No AI provider configured. Please set one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in your environment variables.'
  );
}

export function createAIModel(): ReturnType<ReturnType<typeof getAIProvider>['provider']> {
  const config = getAIProvider();
  return config.provider(config.model);
}
