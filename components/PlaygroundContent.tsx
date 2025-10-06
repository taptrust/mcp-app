'use client';

import { useState } from 'react';
import PreviewPanel from '@/components/PreviewPanel';
import ExampleGallery from '@/components/ExampleGallery';

export default function PlaygroundContent() {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [resourceContent, setResourceContent] = useState<string>('');

  const handleExampleSelect = (promptId: string, content: string) => {
    setSelectedPromptId(promptId);
    setResourceContent(content);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-center font-bold text-slate-900 dark:text-slate-100 mb-2">
            MCP-APP Examples
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Example Prompts
              </h2>
              <ExampleGallery onSelect={handleExampleSelect} />
            </div>

            {selectedPromptId && (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Selected Example
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedPromptId}
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Live Preview
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-lg border p-6 min-h-[400px]">
              {resourceContent ? (
                <PreviewPanel config={resourceContent} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                  <p>Select an example to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}