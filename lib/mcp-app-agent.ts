import { Agent } from '@mastra/core';
import { createAIModel } from './ai-provider';
import { MCP_APP_SYSTEM_PROMPT } from './system-prompt';
import { APP_TYPES } from '../types/app-resources';

export type AppType = typeof APP_TYPES[number]['id'];

function appTypeLabels(): string {
  // "survey, visualization, or product card"
  const labels = APP_TYPES.map(t => t.label);
  return labels.length > 1
    ? `${labels.slice(0, -1).join(', ')}, or ${labels.slice(-1)}`
    : labels[0] ?? '';
}

/**
 * MCP-APP Mastra Agent Configuration
 *
 * Creates and configures the AI agent for generating MCP-UI resources
 */
export function createMCPAppAgent() {
  const aiModel = createAIModel();

  return new Agent({
    name: 'MCP-APP-generator',
    instructions: MCP_APP_SYSTEM_PROMPT,
    model: aiModel,
  });
}

/**
 * Generate MCP-UI resource using the configured agent
 *
 * @param prompt - The user's natural language prompt
 * @param type - Optional: The type of app to generate
 * @param theme - Optional: Theme for the generated app
 * @returns Promise<string | null> - Generated MCP-UI resource JSON or null if not applicable
 */
export async function generateMCPUIResource(
  prompt: string,
  type?: AppType,
  theme?: string
): Promise<string | null> {
  const agent = createMCPAppAgent();

  // Build dynamic guidance from single source of truth
  const labelsList = appTypeLabels();

  let userPrompt = `Please analyze this prompt and generate an appropriate MCP-UI resource if applicable. If the prompt doesn't relate to creating ${labelsList}, return null.

Surveys in particular should be usable for most types of prompts.

For example, if the prompt is "Suggest a healthy meal plan", you could create a survey that asks about dietary preferences and meal preferences.

If the prompt is "What are good beginner investment strategies?", you could create a survey that asks about investment goals and risk tolerance.

Only return null if it would be completely unreasonable to use ${labelsList}.

Prompt: "${prompt}"`;

  if (type) {
    userPrompt += `\n\nType: ${type}`;
  }

  if (theme) {
    userPrompt += `\n\nTheme: ${theme}`;
  }

  userPrompt += '\n\nPlease provide only the MCP-UI resource JSON or null.';

  try {
    const response = await agent.generate([
      { role: 'user', content: userPrompt }
    ]);

    const content = response.text.trim();

    // Check if the response indicates no applicable resource
    if (content.length < 10) {
      return null;
    }

    // Validate JSON
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch (parseError) {
      console.warn('Generated content is not valid JSON:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error generating MCP-UI resource:', error);
    return null;
  }
}