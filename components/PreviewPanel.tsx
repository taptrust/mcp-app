'use client';

import { useState, useEffect } from 'react';
import { AppResource } from '@/types/app-resources';
import SurveyRenderer from './renderers/SurveyRenderer';
import VisualizationRenderer from './renderers/VisualizationRenderer';
import ProductRenderer from './renderers/ProductRenderer';
import { createAppUIResource } from '@/lib/create-app-ui-resource';

interface PreviewPanelProps {
  config: string;
}

export default function PreviewPanel({ config }: PreviewPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [parsedResource, setParsedResource] = useState<AppResource | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'params'>('preview');

   useEffect(() => {
    if (!config) {
      setParsedResource(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(config);
      setParsedResource(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setParsedResource(null);
    }
  }, [config]);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
        <p>Select an example to preview the interactive UI</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400">
        <h3 className="font-semibold mb-2">Error parsing resource</h3>
        <pre className="text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded">{error}</pre>
      </div>
    );
  }

  if (!parsedResource) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const resourceId = `${Date.now()}`;

  return (
    <div className="w-full">
      {/* Custom Tabs Implementation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Interactive Preview
          </button>
          <button
            onClick={() => setActiveTab('params')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'params'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Parameters & Response
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'preview' && (
          <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
            {parsedResource.type === 'survey' && <SurveyRenderer data={parsedResource} />}
            {parsedResource.type === 'visualization' && <VisualizationRenderer data={parsedResource} />}
            {parsedResource.type === 'product' && (
              <ProductRenderer data={parsedResource} />
            )}
          </div>
        )}

        {activeTab === 'params' && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Tool Input Parameters
              </h3>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 overflow-auto">
                <pre className="text-xs text-blue-400 font-mono">
{`{
  "prompt": "Generate an interactive ${parsedResource.type}",
  "type": "${parsedResource.type}",
  "theme": "${parsedResource.theme}"
}`}
                </pre>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                MCP Tool Response
              </h3>
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 overflow-auto max-h-[400px]">
                <pre className="text-xs text-green-400 font-mono">
{JSON.stringify({
  content: [createAppUIResource(parsedResource.type, resourceId)]
}, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                This response uses <a className="underline font-bold" href="https://mcpui.dev/guide/protocol-details">createUIResource</a> from @mcp-ui/server with externalUrl content type
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
