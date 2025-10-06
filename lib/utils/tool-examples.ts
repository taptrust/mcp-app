// Commented out due to incompatibility with ESM in scripts
// import { examples } from '../../demo/src/lib/examples';

/**
 * Get example configurations for the render_app tool documentation.
 * These examples are dynamically loaded from the demo examples to ensure
 * they stay in sync with the actual implementation.
 */
export function getToolExamples() {
  // TODO: Re-enable when demo import is compatible
  // Find key examples for tool documentation
  // const multiPageSurvey = examples.find(e => e.id === 'customer-feedback-multi');
  // const productCatalog = examples.find(e => e.id === 'product-catalog');
  // const visualization = examples.find(e => e.id === 'feedback-chart');

  return {
    multiPageSurvey: null,
    productCatalog: null,
    visualization: null,
  };
}

/**
 * Get a personal finance survey example specifically for TapTrust integration.
 * This shows how to collect financial information from users.
 */
export function getPersonalFinanceSurveyExample() {
  return {
    lifecycle: {
      onCustomEvent: {
        'manual': [
          {
            action: 'show_survey',
            surveyId: 'finance-intake'
          }
        ]
      }
    },
    surveys: {
      'finance-intake': {
        id: 'finance-intake',
        title: 'Let\'s Get Started with Your Finances',
        description: 'Help me understand your financial situation so I can provide personalized guidance',
        pages: [
          {
            id: 'income',
            type: 'textInput',
            title: 'What is your total monthly income?',
            description: 'Include all sources: salary, investments, side income, etc.',
            placeholder: 'e.g., $5,000',
            required: true,
            validation: {
              pattern: '^\\$?[0-9,]+(\\.[0-9]{2})?$',
              message: 'Please enter a valid dollar amount (e.g., $5,000 or 5000)'
            }
          },
          {
            id: 'expense-categories',
            type: 'multipleChoice',
            title: 'Which expense categories do you have?',
            description: 'Select all that apply to your situation',
            options: [
              { id: 'housing', label: 'Housing (rent/mortgage, utilities, maintenance)' },
              { id: 'transport', label: 'Transportation (car payments, gas, insurance, public transit)' },
              { id: 'food', label: 'Food & Dining (groceries, restaurants, delivery)' },
              { id: 'healthcare', label: 'Healthcare (insurance, medical expenses)' },
              { id: 'debt', label: 'Debt Payments (credit cards, student loans, personal loans)' },
              { id: 'savings', label: 'Savings & Investments (401k, IRA, general savings)' },
              { id: 'entertainment', label: 'Entertainment (subscriptions, hobbies, travel)' },
              { id: 'other', label: 'Other Expenses' }
            ],
            allowMultiple: true,
            allowUserOptions: false,
            required: true
          },
          {
            id: 'monthly-expenses',
            type: 'textInput',
            title: 'What are your total monthly expenses?',
            description: 'Estimate your average monthly spending across all categories',
            placeholder: 'e.g., $4,000',
            required: true,
            validation: {
              pattern: '^\\$?[0-9,]+(\\.[0-9]{2})?$',
              message: 'Please enter a valid dollar amount'
            }
          },
          {
            id: 'financial-goals',
            type: 'multipleChoice',
            title: 'What are your primary financial goals?',
            description: 'Select your top 3 priorities',
            options: [
              { id: 'emergency-fund', label: 'Build an emergency fund' },
              { id: 'pay-debt', label: 'Pay off debt' },
              { id: 'save-house', label: 'Save for a home down payment' },
              { id: 'retirement', label: 'Save for retirement' },
              { id: 'invest', label: 'Start investing' },
              { id: 'increase-income', label: 'Increase income' },
              { id: 'reduce-expenses', label: 'Reduce expenses' },
              { id: 'financial-freedom', label: 'Achieve financial independence' }
            ],
            allowMultiple: true,
            maxSelections: 3,
            required: true
          },
          {
            id: 'risk-tolerance',
            type: 'rating',
            title: 'How would you describe your investment risk tolerance?',
            description: '1 = Very conservative (prefer safety), 5 = Very aggressive (willing to take risks)',
            min: 1,
            max: 5,
            labels: {
              min: 'Very Conservative',
              max: 'Very Aggressive'
            },
            required: true
          },
          {
            id: 'additional-info',
            type: 'textInput',
            title: 'Anything else I should know about your financial situation?',
            description: 'Optional: Share any specific concerns, constraints, or context',
            placeholder: 'e.g., Planning to buy a house next year, have kids starting college soon, etc.',
            rows: 4,
            required: false
          }
        ],
        trigger: 'manual',
        styling: {
          theme: 'gradient',
          showProgress: true,
          primaryColor: '#667eea'
        }
      }
    }
  };
}

/**
 * Get formatted examples for tool metadata description.
 */
export function getFormattedToolExamples() {
  const examples = getToolExamples();
  const financeExample = getPersonalFinanceSurveyExample();

  return {
    personalFinanceSurvey: {
      description: 'Multi-page survey for collecting personal finance information',
      config: financeExample,
      usage: {
        config: financeExample,
        context: { event: 'manual' }
      }
    },
    feedbackSurvey: examples.multiPageSurvey ? {
      description: 'Multi-page customer feedback survey with various question types',
      config: examples.multiPageSurvey,
      usage: {
        config: examples.multiPageSurvey,
        context: { event: 'manual' }
      }
    } : null,
    productCatalog: examples.productCatalog ? {
      description: 'Product cards with pricing, ratings, and availability',
      config: examples.productCatalog,
      usage: {
        config: examples.productCatalog,
        context: { event: 'manual' }
      }
    } : null,
    visualization: examples.visualization ? {
      description: 'Data visualization (bar chart) from survey results',
      config: examples.visualization,
      usage: {
        config: examples.visualization,
        context: {
          event: 'survey_complete',
          surveyId: 'user-feedback'
        }
      }
    } : null
  };
}
