"use client"

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Layout, Settings, Users, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import PlaygroundContent from "@/components/PlaygroundContent";

export default function Home() {
  const [mcpUrl, setMcpUrl] = useState('http://localhost:3000/mcp');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocalHost
      ? 'http://localhost:3000'
      : `https://${window.location.host}`;

    setMcpUrl(`${baseUrl}/mcp`);
  }, []);

  const copyToClipboard = (text: string, configName: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      toast.error("Clipboard not available", {
        description: "Please copy the config manually.",
        duration: 3000,
      });
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${configName} config copied to clipboard!`, {
        description: "You can now paste this into your MCP client configuration.",
        duration: 3000,
      });
    }).catch(() => {
      toast.error("Failed to copy to clipboard", {
        description: "Please try copying the config manually.",
        duration: 3000,
      });
    });
  };

  const cursorConfig = `{
  "mcpServers": {
    "MCP-APP": {
      "url": "${mcpUrl}"
    }
  }
}`;

  const claudeConfig = `{
  "mcpServers": {
    "MCP-APP": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${mcpUrl}"]
    }
  }
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 pt-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            MCP-APP: On-Demand Apps for MCP Clients
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
           MCP-APP is a framework built on <a className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold" href="https://mcp-ui.dev">MCP-UI</a> that generates on-demands surveys, visualizations, and product cards from natural language prompts.
          </p>

          <div className="mt-4 grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                This MCP server is available at:
              </p>
              <code className="text-sm font-mono text-blue-900 dark:text-blue-100 break-all">
                {mcpUrl}
              </code>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-1">
                Install the npm package:
              </p>
              <code className="text-sm font-mono text-green-900 dark:text-green-100">
                npm install{' '}
                <a
                  href="https://www.npmjs.com/package/@taptrust/mcp-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  @taptrust/mcp-app
                </a>
              </code>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Surveys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center text-xl dark:text-slate-300 mb-4">
                Create interactive surveys with multiple question types and progress tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Layout className="h-5 w-5 text-green-500" />
                Visualizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center text-xl dark:text-slate-300 mb-4">
                Generate charts and graphs with legends, custom styling, and export options.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Product Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center text-xl dark:text-slate-300 mb-4">
                Display rich product info with pricing, specs, and call-to-action buttons.
              </p>
            </CardContent>
          </Card>
        </div>

        </div>

        <PlaygroundContent />
        </div>
    
   
  );
}
