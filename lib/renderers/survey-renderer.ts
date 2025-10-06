import { createUIResource } from "@mcp-ui/server";
import type { AppConfig } from '../validators/config-validator';
import { renderMultiPageSurvey } from './survey-renderer-multi-page';

export interface SurveyContext {
  event?: string;
  data?: Record<string, any>;
}

/**
 * Renders a survey as an MCP-UI resource
 */
export async function renderSurvey(
  config: AppConfig,
  surveyId: string,
  context?: SurveyContext
): Promise<any> {
  const survey = config.surveys?.[surveyId];

  if (!survey) {
    throw new Error(`Survey with ID "${surveyId}" not found in configuration`);
  }

  // Check if this is a multi-page survey
  if (survey.pages && survey.pages.length > 0) {
    return renderMultiPageSurvey(config, surveyId, context);
  }

  // Check if survey should be shown based on trigger and condition
  if (!shouldShowSurvey(survey, context)) {
    return null;
  }

  // Generate a unique URI for this survey instance
  const uniqueUri = `ui://survey/${surveyId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as `ui://${string}`;

  // Build survey form HTML
  const surveyHtml = buildSurveyHtml(survey);

  const resource = createUIResource({
    uri: uniqueUri,
    content: {
      type: 'rawHtml',
      htmlString: surveyHtml,
    },
    encoding: 'text',
  });

  return resource;
}

/**
 * Determines if a survey should be shown based on trigger and condition
 */
function shouldShowSurvey(survey: any, context?: SurveyContext): boolean {
  // Manual trigger - only show when no event context is provided
  if (survey.trigger === 'manual') {
    return !context?.event;
  }

  // Check if trigger matches context event
  if (context?.event) {
    const triggerMap: Record<string, string> = {
      'conversation_start': 'conversation_start',
      'message_received': 'message_received',
    };

    if (survey.trigger !== triggerMap[context.event]) {
      return false;
    }
  }

  // Check condition if present
  if (survey.condition && context?.data) {
    try {
      // Simple condition evaluation (in production, use a safe eval library)
      return evaluateCondition(survey.condition, context.data);
    } catch (error) {
      console.error(`Error evaluating survey condition: ${error}`);
      return false;
    }
  }

  return true;
}

/**
 * Simple condition evaluator (placeholder for safe evaluation)
 */
function evaluateCondition(condition: string, data: Record<string, any>): boolean {
  // For now, just return true
  // In production, use a safe expression evaluator like expr-eval
  console.warn('Condition evaluation not yet implemented:', condition);
  return true;
}

/**
 * Builds HTML for survey form
 */
function buildSurveyHtml(survey: any): string {
  const fieldsHtml = survey.fields.map((field: any) => buildFieldHtml(field)).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(survey.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .survey-container {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }
    .description {
      color: #666;
      margin-bottom: 24px;
    }
    .field {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      color: #333;
    }
    .required {
      color: #e74c3c;
    }
    input[type="text"],
    input[type="email"],
    input[type="number"],
    input[type="date"],
    textarea,
    select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    textarea {
      min-height: 100px;
      resize: vertical;
    }
    .rating {
      display: flex;
      gap: 8px;
    }
    .rating input {
      display: none;
    }
    .rating label {
      cursor: pointer;
      font-size: 24px;
      color: #ddd;
      transition: color 0.2s;
    }
    .rating label.selected {
      color: #f39c12;
    }
    .checkbox-group,
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .checkbox-option,
    .radio-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    button {
      background: #3498db;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #2980b9;
    }
    .field-description {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="survey-container">
    <h1>${escapeHtml(survey.title)}</h1>
    ${survey.description ? `<p class="description">${escapeHtml(survey.description)}</p>` : ''}
    <form id="surveyForm">
      ${fieldsHtml}
      <button type="submit">Submit</button>
    </form>
  </div>
  <script>
    // Handle rating interactions
    document.querySelectorAll('.rating').forEach(ratingContainer => {
      const labels = Array.from(ratingContainer.querySelectorAll('label'));
      const inputs = Array.from(ratingContainer.querySelectorAll('input'));

      inputs.forEach((input, index) => {
        input.addEventListener('change', () => {
          const value = parseInt(input.value);
          labels.forEach((label, labelIndex) => {
            const labelValue = parseInt(inputs[labelIndex].value);
            if (labelValue <= value) {
              label.classList.add('selected');
            } else {
              label.classList.remove('selected');
            }
          });
        });
      });
    });

    document.getElementById('surveyForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const responses = Object.fromEntries(formData.entries());
      console.log('Survey responses:', responses);
      alert('Survey submitted! (In production, this would send data to the MCP client)');
    });
  </script>
</body>
</html>
  `.trim();
}

/**
 * Builds HTML for a single field
 */
function buildFieldHtml(field: any): string {
  const required = field.required ? '<span class="required">*</span>' : '';
  const description = field.description ? `<div class="field-description">${escapeHtml(field.description)}</div>` : '';

  let inputHtml = '';

  switch (field.type) {
    case 'text':
    case 'email':
      inputHtml = `<input type="${field.type}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
      break;

    case 'textarea':
      inputHtml = `<textarea name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`;
      break;

    case 'number':
      inputHtml = `<input type="number" name="${field.id}" ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.max !== undefined ? `max="${field.max}"` : ''} ${field.required ? 'required' : ''}>`;
      break;

    case 'date':
      inputHtml = `<input type="date" name="${field.id}" ${field.required ? 'required' : ''}>`;
      break;

    case 'rating':
      const max = field.max || 5;
      const min = field.min || 1;
      const stars = [];
      for (let i = min; i <= max; i++) {
        stars.push(`
          <input type="radio" name="${field.id}" value="${i}" id="${field.id}_${i}" ${field.required ? 'required' : ''}>
          <label for="${field.id}_${i}">★</label>
        `);
      }
      inputHtml = `<div class="rating">${stars.join('')}</div>`;
      break;

    case 'single_choice':
      if (field.options) {
        const radios = field.options.map((option: string, index: number) => `
          <div class="radio-option">
            <input type="radio" name="${field.id}" value="${option}" id="${field.id}_${index}" ${field.required ? 'required' : ''}>
            <label for="${field.id}_${index}">${escapeHtml(option)}</label>
          </div>
        `).join('');
        inputHtml = `<div class="radio-group">${radios}</div>`;
      }
      break;

    case 'multiple_choice':
      if (field.options) {
        const checkboxes = field.options.map((option: string, index: number) => `
          <div class="checkbox-option">
            <input type="checkbox" name="${field.id}[]" value="${option}" id="${field.id}_${index}">
            <label for="${field.id}_${index}">${escapeHtml(option)}</label>
          </div>
        `).join('');
        inputHtml = `<div class="checkbox-group">${checkboxes}</div>`;
      }
      break;

    case 'file':
      inputHtml = `<input type="file" name="${field.id}" ${field.required ? 'required' : ''}>`;
      break;
  }

  return `
    <div class="field">
      <label>${escapeHtml(field.label)} ${required}</label>
      ${inputHtml}
      ${description}
    </div>
  `;
}

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
