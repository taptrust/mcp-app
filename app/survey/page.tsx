import SurveyRenderer from '@/components/renderers/SurveyRenderer';

export default function SurveyPage() {
  // Static sample survey data - matching xmcp-mcpui-nextjs-demo pattern
  const sampleData = {
    type: 'survey' as const,
    theme: 'ocean',
    progressTracking: true,
    pages: [
      {
        id: 'page1',
        title: 'Welcome',
        description: 'Thank you for participating in this survey',
        question: {
          id: 'q1',
          type: 'text' as const,
          prompt: 'What is your name?',
          required: true
        }
      },
      {
        id: 'page2',
        question: {
          id: 'q2',
          type: 'choice' as const,
          prompt: 'How satisfied are you with this app?',
          options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
          required: true
        }
      },
      {
        id: 'page3',
        question: {
          id: 'q3',
          type: 'rating' as const,
          prompt: 'On a scale of 1-10, how likely are you to recommend this?',
          scale: {
            min: 1,
            max: 10
          },
          required: true
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <SurveyRenderer data={sampleData} />
      </div>
    </div>
  );
}
