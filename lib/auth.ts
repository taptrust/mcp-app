/**
 * Authentication utilities for MCP-APP
 *
 * This file contains the authentication validation logic for the generate_app tool.
 * Currently, it validates against a simple API key, but can be extended to use
 * more sophisticated authentication methods like JWT, OAuth, or database lookups.
 */

/**
 * Validates the authentication token for MCP-APP tool access
 *
 * @param token - The authentication token from the request header
 * @returns Promise<boolean> - True if authentication is valid, false otherwise
 */
export async function validateAuthToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  // Simple API key validation
  // TODO: Replace with more sophisticated authentication method
  // Options: JWT validation, database lookup, OAuth flow, etc.
  const expectedToken = process.env.MCP_APP_API_KEY;

  if (!expectedToken) {
    console.warn('MCP_APP_API_KEY environment variable not set');
    return false;
  }

  return token === expectedToken;
}

/**
 * Middleware function to validate authentication for MCP tool requests
 *
 * @param request - The incoming request
 * @returns Promise<boolean> - True if request is authenticated
 */
export async function validateRequestAuth(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  return validateAuthToken(token);
}
