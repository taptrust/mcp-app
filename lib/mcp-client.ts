interface MCPCallToolRequest {
  method: string;
  params: {
    name: string;
    arguments: Record<string, any>;
  };
}

interface MCPCallToolResponse {
  content: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>;
}

export class MCPClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async callTool(toolName: string, args: Record<string, any>): Promise<MCPCallToolResponse> {
    const request: MCPCallToolRequest = {
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    };

    // Use XMCP NextJS adapter endpoint (same origin, no CORS issues)
    const response = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async generateApp(prompt: string): Promise<MCPCallToolResponse> {
    return this.callTool('generate_app', { prompt });
  }
}

export const mcpClient = new MCPClient();
