import type { AppConfig } from '../validators/config-validator';

export interface LifecycleContext {
  event: string;
  data?: Record<string, any>;
  surveyId?: string;
  visualizationId?: string;
}

export interface LifecycleAction {
  action: string;
  surveyId?: string;
  visualizationId?: string;
  message?: string;
  mcpTool?: string;
  condition?: string;
  delay?: number;
  data?: Record<string, any>;
}

/**
 * Processes lifecycle hooks and returns actions to execute
 */
export function processLifecycle(
  config: AppConfig,
  context: LifecycleContext
): LifecycleAction[] {
  console.log(`[processLifecycle] ========== PROCESS LIFECYCLE START ==========`);
  console.log(`[processLifecycle] Context:`, JSON.stringify(context, null, 2));
  console.log(`[processLifecycle] Config has lifecycle?`, !!config.lifecycle);

  if (!config.lifecycle) {
    console.log(`[processLifecycle] No lifecycle config found, returning empty actions`);
    return [];
  }

  console.log(`[processLifecycle] Lifecycle config:`, JSON.stringify(config.lifecycle, null, 2));

  const actions: LifecycleAction[] = [];
  const { event, data, surveyId, visualizationId } = context;

  // Get actions for the triggered event
  let eventActions: LifecycleAction[] = [];

  console.log(`[processLifecycle] Looking for actions for event: "${event}"`);

  switch (event) {
    case 'conversation_start':
      eventActions = config.lifecycle.onConversationStart || [];
      console.log(`[processLifecycle] conversation_start actions:`, eventActions.length);
      break;
    case 'message_received':
      eventActions = config.lifecycle.onMessageReceived || [];
      console.log(`[processLifecycle] message_received actions:`, eventActions.length);
      break;
    case 'survey_complete':
      eventActions = config.lifecycle.onSurveyComplete || [];
      console.log(`[processLifecycle] survey_complete actions:`, eventActions.length);
      break;
    case 'visualization_shown':
      eventActions = config.lifecycle.onVisualizationShown || [];
      console.log(`[processLifecycle] visualization_shown actions:`, eventActions.length);
      break;
    default:
      // Check custom events
      console.log(`[processLifecycle] Checking custom events for: "${event}"`);
      console.log(`[processLifecycle] onCustomEvent exists?`, !!config.lifecycle.onCustomEvent);
      console.log(`[processLifecycle] onCustomEvent keys:`, config.lifecycle.onCustomEvent ? Object.keys(config.lifecycle.onCustomEvent) : []);

      if (config.lifecycle.onCustomEvent && config.lifecycle.onCustomEvent[event]) {
        eventActions = config.lifecycle.onCustomEvent[event];
        console.log(`[processLifecycle] Found ${eventActions.length} actions for custom event "${event}"`);
      } else {
        console.log(`[processLifecycle] No custom event actions found for "${event}"`);
      }
  }

  // Filter actions based on conditions
  console.log(`[processLifecycle] Found ${eventActions.length} event actions, filtering by conditions...`);

  for (const action of eventActions) {
    const shouldExecute = shouldExecuteAction(action, { ...context, data: data || {} });
    console.log(`[processLifecycle] Action ${action.action} should execute?`, shouldExecute);
    if (shouldExecute) {
      actions.push(action);
    }
  }

  console.log(`[processLifecycle] Returning ${actions.length} actions after filtering`);
  console.log(`[processLifecycle] ========== PROCESS LIFECYCLE END ==========`);

  return actions;
}

/**
 * Determines if an action should be executed based on its condition
 */
function shouldExecuteAction(action: LifecycleAction, context: LifecycleContext): boolean {
  // If no condition, always execute
  if (!action.condition) {
    return true;
  }

  try {
    return evaluateCondition(action.condition, context);
  } catch (error) {
    console.error(`Error evaluating action condition: ${error}`);
    return false;
  }
}

/**
 * Evaluates a condition expression
 */
function evaluateCondition(condition: string, context: LifecycleContext): boolean {
  const { data, surveyId, visualizationId } = context;

  // Handle surveyId comparisons
  if (condition.includes('surveyId ===') && surveyId) {
    const match = condition.match(/surveyId\s*===\s*['"]([^'"]+)['"]/);
    if (match) {
      return surveyId === match[1];
    }
  }

  // Handle visualizationId comparisons
  if (condition.includes('visualizationId ===') && visualizationId) {
    const match = condition.match(/visualizationId\s*===\s*['"]([^'"]+)['"]/);
    if (match) {
      return visualizationId === match[1];
    }
  }

  // Handle message content checks
  if (condition.includes('message.') && data?.message) {
    const message = String(data.message).toLowerCase();

    // Check for includes
    const includesMatch = condition.match(/message\.(?:toLowerCase\(\)\.)?includes\(['"]([^'"]+)['"]\)/);
    if (includesMatch) {
      return message.includes(includesMatch[1].toLowerCase());
    }
  }

  // Handle data field checks
  if (condition.includes('data.') && data) {
    // Simple field existence check
    const fieldMatch = condition.match(/data\.(\w+)/);
    if (fieldMatch) {
      return data[fieldMatch[1]] !== undefined;
    }
  }

  // For now, warn about unhandled conditions and return true
  console.warn('Condition evaluation not fully implemented:', condition);
  return true;
}

/**
 * Gets all lifecycle events configured
 */
export function getLifecycleEvents(config: AppConfig): string[] {
  if (!config.lifecycle) {
    return [];
  }

  const events: string[] = [];

  if (config.lifecycle.onConversationStart) {
    events.push('conversation_start');
  }
  if (config.lifecycle.onMessageReceived) {
    events.push('message_received');
  }
  if (config.lifecycle.onSurveyComplete) {
    events.push('survey_complete');
  }
  if (config.lifecycle.onVisualizationShown) {
    events.push('visualization_shown');
  }
  if (config.lifecycle.onCustomEvent) {
    events.push(...Object.keys(config.lifecycle.onCustomEvent));
  }

  return events;
}

/**
 * Gets actions for a specific lifecycle event
 */
export function getActionsForEvent(config: AppConfig, event: string): LifecycleAction[] {
  if (!config.lifecycle) {
    return [];
  }

  switch (event) {
    case 'conversation_start':
      return config.lifecycle.onConversationStart || [];
    case 'message_received':
      return config.lifecycle.onMessageReceived || [];
    case 'survey_complete':
      return config.lifecycle.onSurveyComplete || [];
    case 'visualization_shown':
      return config.lifecycle.onVisualizationShown || [];
    default:
      if (config.lifecycle.onCustomEvent && config.lifecycle.onCustomEvent[event]) {
        return config.lifecycle.onCustomEvent[event];
      }
      return [];
  }
}
