/**
 * Multi-Page Survey Renderer
 *
 * Typeform-inspired survey renderer with pagination, smooth animations,
 * and beautiful UX.
 */

import type { AppConfig } from '../validators/config-validator';
import type { SurveyPage, MultipleChoiceOption } from '../validators/survey-validator';
import { createUIResource } from '@mcp-ui/server';

function escapeHtml(text: string): string {
  const div = { textContent: text } as any;
  const escapedText = div.textContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return escapedText;
}

/**
 * Build a text input page
 */
function buildTextInputPage(page: any, pageIndex: number): string {
  const required = page.required ? '<span class="required">*</span>' : '';
  const placeholder = escapeHtml(page.placeholder || 'Type your answer here...');
  const rows = page.rows || 3;

  return `
    <div class="survey-page" data-page="${pageIndex}" style="display: ${pageIndex === 0 ? 'block' : 'none'}">
      <div class="page-content">
        <h2 class="page-title">${escapeHtml(page.title)}${required}</h2>
        ${page.description ? `<p class="page-description">${escapeHtml(page.description)}</p>` : ''}
        <textarea
          class="text-input"
          data-page-id="${page.id}"
          placeholder="${placeholder}"
          rows="${rows}"
        ></textarea>
      </div>
    </div>
  `;
}

/**
 * Build a multiple choice page
 */
function buildMultipleChoicePage(page: any, pageIndex: number): string {
  const required = page.required ? '<span class="required">*</span>' : '';
  const inputType = page.allowMultiple === false ? 'radio' : 'checkbox';

  const optionsHtml = page.options.map((option: MultipleChoiceOption) => `
    <div class="option-card" data-option-id="${option.id}">
      <div class="option-header">
        <input
          type="${inputType}"
          id="option-${pageIndex}-${option.id}"
          name="page-${page.id}"
          value="${option.id}"
          class="option-input"
        />
        <label for="option-${pageIndex}-${option.id}" class="option-label">
          ${escapeHtml(option.label)}
        </label>
      </div>
      ${option.followUpQuestion ? `
        <div class="follow-up" style="display: none;">
          <p class="follow-up-question">${escapeHtml(option.followUpQuestion)}</p>
          <textarea
            class="follow-up-input"
            data-follow-up-for="${option.id}"
            placeholder="Type your answer..."
            rows="2"
          ></textarea>
        </div>
      ` : ''}
    </div>
  `).join('');

  const customOptionHtml = page.allowUserOptions ? `
    <div class="custom-option-input">
      <input
        type="text"
        class="custom-option-field"
        placeholder="Or type your own option..."
        data-page-id="${page.id}"
      />
      <button class="btn-add-option" type="button">Add</button>
    </div>
    <div class="custom-options-list"></div>
  ` : '';

  return `
    <div class="survey-page" data-page="${pageIndex}" style="display: ${pageIndex === 0 ? 'block' : 'none'}">
      <div class="page-content">
        <h2 class="page-title">${escapeHtml(page.title)}${required}</h2>
        ${page.description ? `<p class="page-description">${escapeHtml(page.description)}</p>` : ''}
        <div class="options-grid" data-page-id="${page.id}">
          ${optionsHtml}
        </div>
        ${customOptionHtml}
      </div>
    </div>
  `;
}

/**
 * Build a rating page
 */
function buildRatingPage(page: any, pageIndex: number): string {
  const required = page.required ? '<span class="required">*</span>' : '';
  const min = page.min || 1;
  const max = page.max || 5;

  const starsHtml = Array.from({ length: max - min + 1 }, (_, i) => {
    const value = min + i;
    return `
      <span class="rating-star" data-value="${value}">★</span>
    `;
  }).join('');

  const labelsHtml = page.labels ? `
    <div class="rating-labels">
      ${page.labels.min ? `<span class="label-min">${escapeHtml(page.labels.min)}</span>` : ''}
      ${page.labels.max ? `<span class="label-max">${escapeHtml(page.labels.max)}</span>` : ''}
    </div>
  ` : '';

  return `
    <div class="survey-page" data-page="${pageIndex}" style="display: ${pageIndex === 0 ? 'block' : 'none'}">
      <div class="page-content">
        <h2 class="page-title">${escapeHtml(page.title)}${required}</h2>
        ${page.description ? `<p class="page-description">${escapeHtml(page.description)}</p>` : ''}
        <div class="rating-container" data-page-id="${page.id}">
          ${starsHtml}
        </div>
        ${labelsHtml}
        <input type="hidden" class="rating-value" data-page-id="${page.id}" />
      </div>
    </div>
  `;
}

/**
 * Build the complete multi-page survey HTML
 */
function buildMultiPageSurveyHTML(survey: any): string {
  const pages = survey.pages || [];
  const theme = survey.styling?.theme || 'default';
  const showProgress = survey.styling?.showProgress !== false;
  const primaryColor = survey.styling?.primaryColor || '#007bff';

  const pagesHtml = pages.map((page: SurveyPage, index: number) => {
    switch (page.type) {
      case 'textInput':
        return buildTextInputPage(page, index);
      case 'multipleChoice':
        return buildMultipleChoicePage(page, index);
      case 'rating':
        return buildRatingPage(page, index);
      default:
        return `<div class="survey-page" data-page="${index}">Unknown page type: ${(page as any).type}</div>`;
    }
  }).join('');

  const progressBarHtml = '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(survey.title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: ${theme === 'gradient' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f7fa'};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .survey-container {
      max-width: 700px;
      width: 100%;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      padding: 60px 40px;
      position: relative;
      min-height: 500px;
    }

    .progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 4px;
      background: ${primaryColor};
      transition: width 0.4s ease;
      border-radius: 16px 0 0 0;
    }

    .page-number {
      position: absolute;
      top: 24px;
      right: 40px;
      font-size: 0.875rem;
      color: #999;
      font-weight: 500;
    }

    .survey-page {
      animation: fadeInUp 0.4s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .page-content {
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    .required {
      color: #e53e3e;
      margin-left: 4px;
    }

    .page-description {
      font-size: 1.125rem;
      color: #718096;
      margin-bottom: 32px;
      line-height: 1.6;
    }

    /* Text Input Styles */
    .text-input {
      width: 100%;
      padding: 16px;
      font-size: 1.125rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-family: inherit;
      resize: vertical;
      transition: border-color 0.2s;
    }

    .text-input:focus {
      outline: none;
      border-color: ${primaryColor};
    }

    /* Multiple Choice Styles */
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .option-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
    }

    .option-card:hover {
      border-color: ${primaryColor};
      background: #f7fafc;
    }

    .option-card.selected {
      border-color: ${primaryColor};
      background: #ebf8ff;
    }

    .option-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .option-input {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: ${primaryColor};
    }

    .option-label {
      flex: 1;
      font-size: 1rem;
      cursor: pointer;
      color: #2d3748;
      font-weight: 500;
    }

    .follow-up {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }

    .follow-up-question {
      font-size: 0.875rem;
      color: #4a5568;
      margin-bottom: 8px;
    }

    .follow-up-input {
      width: 100%;
      padding: 8px;
      font-size: 0.875rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-family: inherit;
      resize: none;
    }

    .custom-option-input {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .custom-option-field {
      flex: 1;
      padding: 12px;
      font-size: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
    }

    .btn-add-option {
      padding: 12px 24px;
      background: #edf2f7;
      color: #4a5568;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-add-option:hover {
      background: #e2e8f0;
    }

    /* Rating Styles */
    .rating-container {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin: 32px 0;
    }

    .rating-star {
      font-size: 3rem;
      cursor: pointer;
      transition: all 0.2s;
      opacity: 0.3;
      color: ${primaryColor};
    }

    .rating-star:hover,
    .rating-star.selected {
      opacity: 1;
      transform: scale(1.15);
    }

    .rating-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      font-size: 0.875rem;
      color: #718096;
    }

    /* Navigation Styles */
    .survey-nav {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .btn-next {
      padding: 16px 48px;
      background: ${primaryColor};
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-next:hover:not(:disabled) {
      background: ${primaryColor}dd;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-next:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .completion-message {
      text-align: center;
      padding: 60px 20px;
    }

    .completion-icon {
      width: 80px;
      height: 80px;
      background: #48bb78;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }

    .completion-icon svg {
      width: 40px;
      height: 40px;
      stroke: white;
      stroke-width: 3;
    }

    .completion-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 12px;
    }

    .completion-text {
      font-size: 1.125rem;
      color: #718096;
    }

    @media (max-width: 640px) {
      .survey-container {
        padding: 40px 24px;
      }

      .page-title {
        font-size: 1.5rem;
      }

      .page-description {
        font-size: 1rem;
      }

      .options-grid {
        grid-template-columns: 1fr;
      }

      .rating-star {
        font-size: 2rem;
      }

      .btn-next {
        padding: 14px 32px;
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="survey-container">
    ${progressBarHtml}
    <div class="page-number">
      <span class="current-page">1</span> / <span class="total-pages">${pages.length}</span>
    </div>

    ${pagesHtml}

    <div class="survey-nav">
      <button class="btn-next" type="button">Next</button>
    </div>
  </div>

  <script>
    let currentPage = 0;
    const totalPages = ${pages.length};
    const pages = ${JSON.stringify(pages)};
    const responses = {};
    const surveyId = ${JSON.stringify(survey.id)};
    const surveyStartTime = Date.now();

    // Initialize page visibility
    function showPage(pageIndex) {
      document.querySelectorAll('.survey-page').forEach((page, index) => {
        page.style.display = index === pageIndex ? 'block' : 'none';
      });

      // Update page number
      document.querySelector('.current-page').textContent = pageIndex + 1;

      // Update progress bar
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
        progressBar.style.width = ((pageIndex + 1) / totalPages * 100) + '%';
      }

      // Update button text
      const btnNext = document.querySelector('.btn-next');
      btnNext.textContent = pageIndex === totalPages - 1 ? 'Submit' : 'Next';

      // Validate current page
      validatePage(pageIndex);
    }

    // Validate the current page
    function validatePage(pageIndex) {
      const page = pages[pageIndex];
      const btnNext = document.querySelector('.btn-next');

      if (!page.required) {
        btnNext.disabled = false;
        return;
      }

      let isValid = false;

      if (page.type === 'textInput') {
        const textarea = document.querySelector(\`textarea[data-page-id="\${page.id}"]\`);
        isValid = textarea && textarea.value.trim().length > 0;
      } else if (page.type === 'multipleChoice') {
        const checked = document.querySelectorAll(\`input[name="page-\${page.id}"]:checked\`);
        isValid = checked.length > 0;
      } else if (page.type === 'rating') {
        const ratingValue = document.querySelector(\`.rating-value[data-page-id="\${page.id}"]\`);
        isValid = ratingValue && ratingValue.value !== '';
      }

      btnNext.disabled = !isValid;
    }

    // Save current page response
    function saveCurrentPageResponse() {
      const page = pages[currentPage];

      if (page.type === 'textInput') {
        const textarea = document.querySelector(\`textarea[data-page-id="\${page.id}"]\`);
        responses[page.id] = { type: 'textInput', value: textarea.value };
      } else if (page.type === 'multipleChoice') {
        const checked = Array.from(document.querySelectorAll(\`input[name="page-\${page.id}"]:checked\`));
        const optionIds = checked.map(input => input.value);
        const followUpAnswers = {};

        optionIds.forEach(optionId => {
          const followUpInput = document.querySelector(\`textarea[data-follow-up-for="\${optionId}"]\`);
          if (followUpInput && followUpInput.value) {
            followUpAnswers[optionId] = followUpInput.value;
          }
        });

        responses[page.id] = { type: 'multipleChoice', optionIds, followUpAnswers };
      } else if (page.type === 'rating') {
        const ratingValue = document.querySelector(\`.rating-value[data-page-id="\${page.id}"]\`);
        responses[page.id] = { type: 'rating', value: parseInt(ratingValue.value) };
      }
    }

    // Handle next button
    document.querySelector('.btn-next').addEventListener('click', () => {
      saveCurrentPageResponse();

      if (currentPage === totalPages - 1) {
        // Submit survey
        completeSurvey();
      } else {
        currentPage++;
        showPage(currentPage);
      }
    });

    /**
     * Format survey results as readable text with structured data
     */
    function formatSurveyResults(surveyId, responses, pages, metadata) {
      const timeMinutes = Math.floor(metadata.timeSpent / 60);
      const timeSeconds = metadata.timeSpent % 60;
      const timeStr = timeMinutes > 0
        ? timeMinutes + ' minute' + (timeMinutes !== 1 ? 's' : '') + ' ' + timeSeconds + ' seconds'
        : timeSeconds + ' seconds';

      let formattedText = 'Survey completed in ' + timeStr + '\\n\\n';
      formattedText += '=== Survey Responses ===\\n\\n';

      // Format each response with question context
      pages.forEach(function(page, index) {
        const response = responses[page.id];
        if (!response) return;

        formattedText += (index + 1) + '. ' + page.title + '\\n';

        if (response.type === 'textInput') {
          formattedText += '   Answer: "' + response.value + '"\\n\\n';
        } else if (response.type === 'multipleChoice') {
          const selectedOptions = page.options
            .filter(function(opt) { return response.optionIds.includes(opt.id); })
            .map(function(opt) {
              let optText = '• ' + opt.label;
              if (response.followUpAnswers && response.followUpAnswers[opt.id]) {
                optText += '\\n     Follow-up: "' + response.followUpAnswers[opt.id] + '"';
              }
              return optText;
            })
            .join('\\n   ');
          formattedText += '   Selected:\\n   ' + selectedOptions + '\\n\\n';
        } else if (response.type === 'rating') {
          const scale = page.max || 5;
          formattedText += '   Rating: ' + response.value + ' / ' + scale + '\\n\\n';
        }
      });

      // Include structured JSON data for programmatic processing
      formattedText += '\\n=== Structured Data ===\\n';
      formattedText += '\`\`\`json\\n';
      formattedText += JSON.stringify({
        surveyId: surveyId,
        responses: responses,
        metadata: metadata
      }, null, 2);
      formattedText += '\\n\`\`\`\\n';

      return formattedText;
    }

    // Complete survey
    function completeSurvey() {
      // Calculate completion time
      const surveyEndTime = Date.now();
      const timeSpent = Math.floor((surveyEndTime - surveyStartTime) / 1000); // in seconds

      // Prepare survey metadata
      const metadata = {
        completedAt: new Date().toISOString(),
        pageCount: totalPages,
        timeSpent: timeSpent
      };

      // Format survey results for assistant
      const formattedResults = formatSurveyResults(surveyId, responses, pages, metadata);

      // Send as MCP-UI standard 'prompt' action to trigger assistant response
      const promptAction = {
        type: 'prompt',
        payload: {
          prompt: formattedResults
        },
        messageId: crypto.randomUUID()
      };

      console.log('Survey completed - sending prompt to assistant:', {
        surveyId: surveyId,
        responseCount: Object.keys(responses).length,
        timeSpent: timeSpent
      });

      // Send standard MCP-UI prompt action to parent (triggers assistant response)
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(promptAction, '*');
      }

      // Also dispatch custom DOM event for local handling if needed
      const completionEvent = {
        type: 'survey_complete',
        surveyId: surveyId,
        responses: responses,
        metadata: metadata
      };
      window.dispatchEvent(new CustomEvent('survey-complete', {
        detail: completionEvent
      }));

      // Show completion message
      const container = document.querySelector('.survey-container');
      container.innerHTML = \`
        <div class="completion-message">
          <div class="completion-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="completion-title">Thank You!</h2>
          <p class="completion-text">Your responses have been recorded.</p>
        </div>
      \`;
    }

    // Add event listeners for multiple choice options
    document.querySelectorAll('.option-card').forEach(card => {
      const input = card.querySelector('.option-input');
      const followUp = card.querySelector('.follow-up');

      // Update visual state based on input checked state
      function updateCardState() {
        if (input.checked) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
        if (followUp) {
          followUp.style.display = input.checked ? 'block' : 'none';
        }
        validatePage(currentPage);
      }

      card.addEventListener('click', (e) => {
        if (e.target.tagName !== 'TEXTAREA') {
          input.click();
        }
      });

      input.addEventListener('change', updateCardState);
    });

    // Add event listeners for rating stars
    document.querySelectorAll('.rating-container').forEach(container => {
      const stars = container.querySelectorAll('.rating-star');
      const pageId = container.dataset.pageId;
      const ratingValue = document.querySelector(\`.rating-value[data-page-id="\${pageId}"]\`);

      stars.forEach((star, index) => {
        star.addEventListener('click', () => {
          const value = parseInt(star.dataset.value);
          ratingValue.value = value;

          // Update star display
          stars.forEach((s, i) => {
            s.classList.toggle('selected', parseInt(s.dataset.value) <= value);
          });

          validatePage(currentPage);
        });

        star.addEventListener('mouseenter', () => {
          const value = parseInt(star.dataset.value);
          stars.forEach(s => {
            s.style.opacity = parseInt(s.dataset.value) <= value ? '1' : '0.3';
          });
        });
      });

      container.addEventListener('mouseleave', () => {
        const currentValue = parseInt(ratingValue.value) || 0;
        stars.forEach(s => {
          s.style.opacity = parseInt(s.dataset.value) <= currentValue ? '1' : '0.3';
        });
      });
    });

    // Add event listeners for text inputs
    document.querySelectorAll('.text-input').forEach(input => {
      input.addEventListener('input', () => validatePage(currentPage));
    });

    // Initialize
    showPage(0);
  </script>
</body>
</html>
  `;
}

/**
 * Render a multi-page survey
 */
export async function renderMultiPageSurvey(
  config: AppConfig,
  surveyId: string,
  context?: { event?: string; data?: Record<string, any> }
): Promise<any> {
  const survey = config.surveys?.[surveyId];

  if (!survey) {
    throw new Error(`Survey with ID "${surveyId}" not found in configuration`);
  }

  if (!survey.pages || survey.pages.length === 0) {
    throw new Error(`Survey "${surveyId}" does not have pages`);
  }

  const html = buildMultiPageSurveyHTML(survey);

  return createUIResource({
    uri: `ui://survey/${surveyId}` as `ui://${string}`,
    content: {
      type: 'rawHtml',
      htmlString: html,
    },
    encoding: 'text',
    uiMetadata: {
      'preferred-frame-size': ['100%', '700px'],
    },
  });
}
