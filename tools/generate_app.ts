// src/tools/generate_app.ts
import { z } from "zod";
import { type InferSchema } from "xmcp";
import { validateRequestAuth } from "../lib/auth";
import { generateMCPUIResource } from "../lib/mcp-app-agent";
import { createAppUIResource } from "../lib/create-app-ui-resource";

const DEFAULT_APP_TYPE = 'survey';

export const schema = {
  prompt: z.string().min(1).describe("The user's natural language prompt describing what they need"),
  type: z.enum(["survey", "visualization", "product"]).optional()
    .describe("Optional: Specify the type of app to generate"),
  theme: z.string().optional().describe("Optional: Theme for the generated app"),
};

export const metadata = {
  name: "generate_app",
  description:
    "Generate interactive apps (surveys, visualizations, product cards) on-demand using AI agents. Requires Authorization: Bearer <token>.",
  annotations: {
    title: "Generate Interactive App",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
  },
};


export default async function generate_app(
  args: InferSchema<typeof schema>,
  context?: any
) {
  console.log('[generate_app] ========== START ==========');
  console.log('[generate_app] Raw args:', args);
  console.log('[generate_app] Context:', context);

  const { prompt, type, theme } = args || {};
  console.log('[generate_app] Input:', { prompt, type, theme });

  // Optional auth: prefer xmcp middleware, but this is fine if you need per-tool checks
  if (context?.request) {
    const ok = await validateRequestAuth(context.request);
    if (!ok) {
      console.log('[generate_app] Auth failed');
      return {
        content: [
          {
            type: "text",
            text: "Authentication required. Provide a valid API key in the Authorization header (Bearer <token>).",
          },
        ],
        isError: true,
      };
    }
  }

    // Determine app type from parameter or parse from generated JSON
    let appType = type ?? DEFAULT_APP_TYPE;

  const resourceJson = await generateMCPUIResource(prompt, appType, theme);

  if (!resourceJson) {
    console.log('[generate_app] No resource generated');
    return { content: [{ type: "text", text: "No interactive app generated for this prompt." }] };
  }

  console.log('[generate_app] Resource generated, length:', resourceJson.length);



  if (!appType) {
    console.error('[generate_app] App type is undefined');
    return { content: [{ type: "text", text: "Could not determine app type." }] };
  }

  console.log('[generate_app] App type:', appType);

  // Generate unique resource ID
  const resourceId = `${Date.now()}`;

  // Create UI resource
  const uiResource = createAppUIResource(appType, resourceId);

  console.log('[generate_app] Returning UI resource with uri:', uiResource.resource.uri);
  console.log('[generate_app] ========== END ==========');

  return {
    content: [uiResource],
  };
}