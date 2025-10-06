import { createMcpHandler } from 'mcp-handler';
import type { NextRequest } from 'next/server';

// Initialize MCP handler with default configuration
const handler = createMcpHandler(
  async (server: any) => {
    // Initialize your MCP server here
    // Example: server.registerTool(...)
  },
  {
    serverInfo: {
      name: 'mcp-app',
      version: '1.0.0'
    }
  }
);

export async function GET(request: NextRequest, context: { params: Promise<{ transport: string }> }) {
  return handler.GET(request);
}

export async function POST(request: NextRequest, context: { params: Promise<{ transport: string }> }) {
  return handler.POST(request);
}