import { createMcpHandler } from 'mcp-handler';
import type { NextRequest } from 'next/server';

console.log('[MCP Route] Initializing MCP handler');

// Initialize MCP handler with default configuration
const handler = createMcpHandler(
  async (server: any) => {
    // Initialize your MCP server here
    // Example: server.registerTool(...)
    console.log('[MCP Route] Server initialized');
  },
  {
    serverInfo: {
      name: 'mcp-app',
      version: '1.0.0'
    }
  }
);

export async function GET(request: NextRequest) {
  return handler.GET(request);
}

export async function POST(request: NextRequest) {
  return handler.POST(request);
}

console.log('[MCP Route] Handler ready');
