import { createUIResource } from "@mcp-ui/server";

/**
 * Creates a UI resource for an app (survey, visualization, product)
 * This shared function is used by both the generate_app tool and PreviewPanel
 * to ensure they return identical responses.
 */
export function createAppUIResource(appType: string, resourceId: string) {
  // Get the current host from environment
  const requestHost = process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}`
    : 'localhost:3000';

  const scheme = requestHost.includes('localhost') || requestHost.includes('127.0.0.1') ? 'http' : 'https';
  const appPageUrl = `${scheme}://${requestHost}/${appType}`;

  // Generate unique URI for this specific resource (ID in URI for uniqueness, but not in URL)
  const uniqueUIAppUri = `ui://${appType}/${resourceId}` as `ui://${string}`;

  const resource = createUIResource({
    uri: uniqueUIAppUri,
    content: { type: 'externalUrl', iframeUrl: appPageUrl },
    encoding: 'text',
  });

  return resource;
}
