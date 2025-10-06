# MCP-APP

**MCP-APP** is an AI-powered MCP (Model Context Protocol) server that generates interactive applications on-demand from natural language prompts. It uses advanced AI agents to create surveys, visualizations, and product cards as MCP-UI resources.

> ⚠️ **MCP-UI Required**: This server returns [MCP-UI](https://mcp-ui.com) formatted resources. Your MCP client must support MCP-UI rendering to display the interactive apps.

## Features

- 🤖 **AI-Powered Generation** - Uses Mastra AI agents to generate apps from natural language prompts
- 🔐 **Secure Authentication** - API key-based authentication for tool access
- 🎨 **Multiple AI Providers** - Supports OpenAI, Anthropic Claude, and Google Gemini
- 🔌 **MCP Protocol** - Standard Model Context Protocol for seamless AI assistant integration
- 🎯 **Type & Theme Support** - Optional parameters to control app type and visual theme
- 📊 **Three App Types** - Surveys, visualizations, and product cards
- 🌐 **Next.js Playground** - Interactive web playground for testing

## How It Works

MCP-APP uses an AI agent (powered by Mastra) and MCP-UI's external URL pattern to deliver interactive apps:

1. **Analyze** - AI agent processes your natural language prompt
2. **Determine** - Identifies if the prompt relates to creating a survey, visualization, or product card
3. **Generate** - Creates a JSON schema for the app structure
4. **Return** - Returns an MCP-UI resource with an iframe URL pointing to a Next.js route that renders the app

### Architecture

```
┌─────────────────┐
│  MCP Client     │
│  (with MCP-UI)  │
└────────┬────────┘
         │ calls generate_app tool
         ▼
┌─────────────────┐
│  MCP-APP Tool   │
│  (XMCP Server)  │
└────────┬────────┘
         │ uses AI agent
         ▼
┌─────────────────┐      ┌──────────────────┐
│  Mastra Agent   │──────▶│  JSON Schema     │
│  (LLM powered)  │      │  (app structure) │
└─────────────────┘      └──────────────────┘
         │
         │ creates UI resource
         ▼
┌─────────────────────────────────────┐
│  MCP-UI Resource (externalUrl)      │
│  uri: "ui://survey/123"             │
│  iframeUrl: "http://localhost:3001/survey"│
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Next.js App Routes                 │
│  /survey, /visualization, /product  │
│  (render with React components)     │
└─────────────────────────────────────┘
```

The generated apps are rendered in iframes, allowing them to run independently while communicating with the MCP client via `postMessage` events.

## Supported App Types

### 1. Surveys
Interactive forms for collecting structured user input with various question types, conditional logic, and validation.

**Example Prompt:**
```
"Create a customer satisfaction survey for our new product launch"
```

### 2. Visualizations
Data-driven charts and graphs for presenting information visually with multiple chart types and interactive features.

**Example Prompt:**
```
"Create a sales performance dashboard showing monthly revenue trends"
```

### 3. Product Cards
Rich product presentations with images, descriptions, features, pricing, and call-to-action buttons.

**Example Prompt:**
```
"Design a product page for our premium wireless headphones with noise cancellation"
```

## Data Requirements for Prompts

### Including Data in Your Prompts

When creating apps that need to display specific data (like product information, survey questions, or chart data), **you must include that data directly in your prompt**. The AI agent needs access to the actual data to generate properly populated apps.

**Important**: The generated apps will only contain the data you provide in the prompt. If you want specific products, survey questions, or chart data to appear, include it explicitly.

### Example: Product Data

**❌ Without Data (Generic):**
```
"Create a product page for headphones"
```

**✅ With Data (Specific):**
```
"Create a product page for our Premium Wireless Headphones with the following details:
- Name: Premium Wireless Headphones
- Description: Experience superior audio quality with our flagship wireless headphones. Features active noise cancellation and 30-hour battery life.
- Price: $199.99 (was $249.99)
- Features: Active Noise Cancellation, 30-hour Battery Life, Premium Materials
- Specifications: Driver Size 40mm, Bluetooth 5.0, Weight 290g
- Call-to-action: Buy Now"
```

### Example: Survey Data

**❌ Without Data (Empty Survey):**
```
"Create a customer satisfaction survey"
```

**✅ With Data (Populated Survey):**
```
"Create a customer satisfaction survey with these questions:
1. What is your overall impression of our new product? (text input)
2. How would you rate the quality? (multiple choice: Poor, Fair, Good, Excellent)
3. How likely are you to recommend us? (rating scale 1-10)
4. Any additional comments? (optional text)"
```

### Example: Visualization Data

**❌ Without Data (No Chart Data):**
```
"Create a sales dashboard"
```

**✅ With Data (Chart with Data):**
```
"Create a sales dashboard showing monthly revenue trends with this data:
- January: $45,000
- February: $52,000
- March: $48,000
- April: $61,000
- May: $55,000
- June: $67,000"
```

### Best Practices for Data Inclusion

1. **Be Specific**: Include exact values, options, and descriptions
2. **Structure Data Clearly**: Use bullet points, numbered lists, or clear formatting
3. **Include All Details**: Think about what should actually appear in the final app
4. **Test Your Prompt**: Generate examples and verify the data appears as expected

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- At least one AI provider API key (OpenAI, Anthropic, or Google)
- MCP client with MCP-UI support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/MCP-APP.git
cd MCP-APP

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys
```

### Environment Setup

Create a `.env` file with the following variables:

```bash
# Authentication (required)
MCP_APP_API_KEY=your-secret-api-key-here

# AI Provider (at least one required)
OPENAI_API_KEY=your-openai-key
# OR
ANTHROPIC_API_KEY=your-anthropic-key
# OR
GEMINI_API_KEY=your-gemini-key

# Optional: Specify AI model
AI_MODEL=gpt-4  # or claude-3-sonnet, gemini-pro, etc.
```

### Running the Server

```bash
# Development mode
pnpm dev

# Production build
pnpm build && pnpm start
```

The server will start with:
- **MCP endpoint**: Available via XMCP
- **Web playground**: http://localhost:3000/playground

## Using the generate_app Tool

### Tool Parameters

```typescript
{
  prompt: string,      // Required: Natural language description
  type?: string,       // Optional: 'survey' | 'visualization' | 'product'
  theme?: string       // Optional: Theme name (e.g., 'modern', 'minimal', 'corporate')
}
```

### Authentication

All tool calls require authentication via the `authorization` header:

```
authorization: Bearer <your-MCP_APP_API_KEY>
```

### Example Usage

**Basic usage:**
```typescript
await mcpClient.callTool('generate_app', {
  prompt: 'Create a customer feedback survey'
});
```

**With type and theme:**
```typescript
await mcpClient.callTool('generate_app', {
  prompt: 'Create a sales dashboard',
  type: 'visualization',
  theme: 'corporate'
});
```

**Returns:**

MCP-UI resource with external URL pattern:

```json
{
  "content": [
    {
      "type": "resource",
      "resource": {
        "uri": "ui://survey/1234567890",
        "mimeType": "text/uri-list",
        "text": "http://localhost:3001/survey"
      }
    }
  ]
}
```

Or text response if the prompt doesn't match a supported app type:

```json
{
  "content": [
    {
      "type": "text",
      "text": "No interactive app generated for this prompt."
    }
  ]
}
```

## MCP Client Integration

### Prerequisites

Your MCP client must support [MCP-UI](https://mcp-ui.com). Install the MCP-UI client library:

```bash
npm install @mcp-ui/client@^5.12.0
# or
pnpm add @mcp-ui/client@^5.12.0
```

### Configuration

Add MCP-APP to your MCP client configuration:

```json
{
  "mcpServers": {
    "MCP-APP": {
      "command": "node",
      "args": ["/path/to/MCP-APP/dist/index.js"],
      "env": {
        "MCP_APP_API_KEY": "your-api-key",
        "OPENAI_API_KEY": "your-openai-key"
      }
    }
  }
}
```

### Rendering MCP-UI Resources

```typescript
import { UIResourceRenderer } from '@mcp-ui/client';

// Call the tool
const result = await mcpClient.callTool('generate_app', {
  prompt: 'Create a product showcase for smart watches'
});

// Render the resource
<UIResourceRenderer content={result.content} />
```

### Receiving Events from MCP-APP

MCP-APP resources communicate with the host application via `postMessage` events. The host application should listen for messages to handle user interactions like survey submissions, button clicks, and other events.

#### Event Types

MCP-UI supports several event types that embedded apps can send to the host:

- **`intent`** - User has expressed an intent that the host should act on (e.g., submit survey)
- **`notify`** - App is notifying the host to trigger side effects (e.g., data updated)
- **`tool`** - App requests the host to run an MCP tool call
- **`prompt`** - App requests the host to run an AI prompt
- **`link`** - App requests navigation to a URL

#### Listening for Events

```typescript
import { UIResourceRenderer } from '@mcp-ui/client';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin in production
      // if (event.origin !== expectedOrigin) return;

      const { type, payload } = event.data;

      switch (type) {
        case 'intent':
          // Handle user intent (e.g., survey submission)
          console.log('Intent:', payload.intent, payload.params);
          if (payload.intent === 'submit-survey') {
            handleSurveySubmission(payload.params);
          }
          break;

        case 'notify':
          // Handle notification
          console.log('Notification:', payload.message);
          break;

        case 'tool':
          // Handle tool call request
          mcpClient.callTool(payload.toolName, payload.params);
          break;

        case 'prompt':
          // Handle prompt request
          mcpClient.sendPrompt(payload.prompt);
          break;

        case 'link':
          // Handle navigation request
          window.location.href = payload.url;
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <UIResourceRenderer content={resourceContent} />;
}
```

#### Survey Response Example

When a user completes a survey, the embedded app sends an `intent` message with the survey responses:

```typescript
// Example message sent from the survey app
window.parent.postMessage(
  {
    type: 'intent',
    payload: {
      intent: 'submit-survey',
      params: {
        surveyId: 'customer-satisfaction-001',
        responses: {
          question1: 'Very satisfied',
          question2: 8,
          question3: 'Great product quality'
        },
        timestamp: '2024-01-15T10:30:00Z'
      }
    }
  },
  '*'
);
```

#### Handling Survey Submissions

```typescript
async function handleSurveySubmission(params: any) {
  const { surveyId, responses, timestamp } = params;

  // Process the survey responses
  console.log(`Survey ${surveyId} submitted at ${timestamp}`);
  console.log('Responses:', responses);

  // Save to database, send to analytics, etc.
  await saveSurveyResults(surveyId, responses);

  // Show confirmation to user
  showNotification('Survey submitted successfully!');

  // Optionally trigger follow-up actions
  if (responses.rating < 5) {
    await mcpClient.callTool('create_support_ticket', {
      reason: 'Low satisfaction score',
      customerFeedback: responses
    });
  }
}
```

#### Security Considerations

When handling `postMessage` events in production:

```typescript
const ALLOWED_ORIGINS = [
  'https://your-domain.com',
  'http://localhost:3000' // For development
];

window.addEventListener('message', (event) => {
  // Validate origin
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    console.warn('Rejected message from unauthorized origin:', event.origin);
    return;
  }

  // Process message
  handleMessage(event);
});
```

For more details on MCP-UI events and iframe communication, see the [MCP-UI Embeddable UI documentation](https://mcp-ui.com/guide/embeddable-ui.html).

## Playground Examples

The project includes example prompts that can be used to generate sample apps:

```bash
# Generate example apps
pnpm generate-examples
```

This will:
1. Read prompts from `example-app-prompts.json`
2. Use the AI agent to generate MCP-UI resources
3. Save them to the `examples/` directory
4. Create a mapping file for the playground

## Project Structure

```
MCP-APP/
├── tools/                       # MCP tool implementations
│   └── generate_app.ts         # Main generation tool
├── lib/                        # Core libraries
│   ├── auth.ts                # Authentication
│   ├── ai-provider.ts         # AI provider selection
│   ├── mcp-app-agent.ts       # Mastra agent setup
│   ├── system-prompt.ts       # Agent instructions
│   └── create-app-ui-resource.ts # UI resource factory
├── app/                        # Next.js application
│   ├── survey/page.tsx        # Survey renderer route
│   ├── visualization/page.tsx # Visualization renderer route
│   ├── product/page.tsx       # Product renderer route
│   └── page.tsx               # Homepage with playground
├── components/
│   ├── renderers/             # Custom app renderers
│   │   ├── SurveyRenderer.tsx
│   │   ├── VisualizationRenderer.tsx
│   │   └── ProductRenderer.tsx
│   ├── PreviewPanel.tsx       # Preview component
│   └── ui/                    # shadcn UI components
├── types/
│   └── app-resources.ts       # TypeScript interfaces
├── scripts/
│   └── generate-examples.ts   # Example generation
├── public/
│   ├── example-app-prompts.json # Example prompts
│   └── examples/              # Generated examples
└── .xmcp/                     # XMCP adapter (auto-generated)
```

### Key Files

- **`tools/generate_app.ts`** - MCP tool that receives prompts and returns UI resources
- **`lib/create-app-ui-resource.ts`** - Shared function for creating MCP-UI resources with externalUrl pattern
- **`app/[type]/page.tsx`** - Static Next.js routes that render the interactive apps
- **`components/renderers/*`** - React components that render app JSON schemas as interactive UI

## Extending MCP-APP

### Adding New App Types with Custom Renderers

This project uses **custom React renderers** to display interactive UI from JSON schemas. Follow these steps to add a new app type:

#### 1. Define TypeScript Interfaces

Add the app to `APP_TYPES` and create a type definition in `types/app-resources.ts`:


```typescript
// Example: Adding a "calendar" app type
export interface CalendarResource {
  type: 'calendar';
  theme: string;
  events: Array<{
    id: string;
    title: string;
    date: string;
    description?: string;
  }>;
  viewMode?: 'month' | 'week' | 'day';
}

// Add to the union type
export type AppResource =
  | SurveyResource
  | VisualizationResource
  | ProductResource
  | CalendarResource;  // Add here
```

#### 2. Create a Custom Renderer Component

Create a renderer in `/components/renderers/CalendarRenderer.tsx`:

```typescript
'use client';

import { CalendarResource } from '@/types/app-resources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalendarRendererProps {
  data: CalendarResource;
}

export default function CalendarRenderer({ data }: CalendarRendererProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar: {data.viewMode || 'month'} view</CardTitle>
        </CardHeader>
        <CardContent>
          {data.events.map((event) => (
            <div key={event.id} className="mb-4 p-4 border rounded">
              <h3 className="font-bold">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.date}</p>
              {event.description && <p className="mt-2">{event.description}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Renderer Best Practices:**
- Use basic HTML/CSS or available shadcn components from `/components/ui/`
- Add dark mode support with Tailwind's `dark:` classes
- Keep components client-side with `'use client'`
- Use TypeScript for type safety

#### 3. Create Static App Route

Add a new route in `/app/calendar/page.tsx`:

```typescript
import CalendarRenderer from '@/components/renderers/CalendarRenderer';

export default function CalendarPage() {
  // Static sample calendar data
  const sampleData = {
    type: 'calendar' as const,
    theme: 'modern',
    viewMode: 'month' as const,
    events: [
      { id: '1', title: 'Team Meeting', date: '2024-01-15', description: 'Weekly sync' }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <CalendarRenderer data={sampleData} />
      </div>
    </div>
  );
}
```

#### 4. Update PreviewPanel

Add the new renderer to `/components/PreviewPanel.tsx`:

```typescript
import CalendarRenderer from './renderers/CalendarRenderer';

// Inside the preview tab:
{parsedResource.type === 'calendar' && <CalendarRenderer data={parsedResource} />}
```

#### 5. Update the AI Agent

**Update the system prompt** (`lib/system-prompt.ts`):
```typescript
export const MCP_APP_SYSTEM_PROMPT = `
Supported app types:
- surveys
- visualizations
- products
- calendar  // Add new type
`;
```

**Update the tool schema** (`tools/generate_app.ts`):
```typescript
enum: ["survey", "visualization", "product", "calendar"]
```

#### 6. Add Example Prompts

Add to `example-app-prompts.json`:

```json
{
  "type": "calendar",
  "prompt": "Create a monthly calendar showing team events and deadlines"
}
```

#### 7. Generate and Test

```bash
# Generate examples with the new type
pnpm generate-examples

# Start the dev server
pnpm dev

# Visit http://localhost:3000 and test the new renderer
```

### Available UI Components

The project includes these shadcn components in `/components/ui/`:
- Button
- Card (with CardHeader, CardTitle, CardDescription, CardContent)
- Input
- Select

For components not available, use basic HTML with Tailwind CSS classes.

### Adding New Themes

Themes are freeform strings passed to the AI agent. Simply use any theme name in your prompts:

```typescript
{
  prompt: "Create a survey",
  theme: "futuristic"  // Any theme name
}
```

The AI agent will interpret and apply the theme styling.

## Development

```bash
# Run tests
pnpm test

# Type checking
pnpm type-check

# Build
pnpm build

# Clean build artifacts
pnpm clean
```

## Authentication Customization

The default authentication validates against the `MCP_APP_API_KEY` environment variable. To implement more sophisticated authentication:

Edit `lib/auth.ts`:

```typescript
export async function validateAuthToken(token: string): Promise<boolean> {
  // Replace with your authentication logic:
  // - JWT validation
  // - Database lookup
  // - OAuth flow
  // - etc.

  return yourCustomValidation(token);
}
```

## Troubleshooting

**Error: "No AI provider configured"**
- Ensure at least one AI provider API key is set in your `.env` file

**Error: "Authentication required"**
- Make sure `MCP_APP_API_KEY` is set and passed in the authorization header

**Error: "Resource not found for example"**
- Run `pnpm generate-examples` to generate example resources

## Links

- **MCP-UI**: https://mcp-ui.com - Required for rendering interactive apps
- **MCP-UI Client**: https://npmjs.com/package/@mcp-ui/client
- **XMCP Framework**: https://xmcp.dev
- **Mastra**: https://mastra.ai
- **Model Context Protocol**: https://modelcontextprotocol.io

## License

MIT - See LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using XMCP, Mastra, and MCP-UI**
