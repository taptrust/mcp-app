'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Import the JSON file directly
import examplePrompts from '../public/example-app-prompts.json';

interface ExamplePrompt {
  id: string;
  prompt: string;
  type: string;
  theme: string;
  description: string;
  category: string;
}

interface ExampleGalleryProps {
  onSelect: (promptId: string, resourceContent: string) => void;
}

export default function ExampleGallery({ onSelect }: ExampleGalleryProps) {
  const [examples, setExamples] = useState<ExamplePrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExamples = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the imported JSON data directly
        const promptsData = examplePrompts;

        // Flatten all categories into single array
        const allExamples: ExamplePrompt[] = [];

        for (const [category, prompts] of Object.entries(promptsData)) {
          for (const prompt of prompts as any[]) {
            allExamples.push({
              ...prompt,
              category: category
            });
          }
        }

        setExamples(allExamples);

        // Auto-select the first example
        if (allExamples.length > 0) {
          handleSelect(allExamples[0]);
        }
      } catch (err) {
        console.error('Error loading example prompts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load example prompts');
      } finally {
        setLoading(false);
      }
    };

    loadExamples();
  }, []);

  const handleSelect = async (example: ExamplePrompt) => {
    try {
      // Dynamically import the example file
      const module = await import(`../public/examples/${example.id}.json`);
      const resourceContent = JSON.stringify(module.default || module);
      onSelect(example.id, resourceContent);
    } catch (err) {
      console.error('Error loading example resource:', err);
      alert(`Failed to load example resource: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin mr-2" />
          <span className="text-slate-600 dark:text-slate-400">Loading examples...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          Error loading examples: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {examples.map((example) => (
          <button
            key={example.id}
            className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left w-full cursor-pointer"
            onClick={() => handleSelect(example)}
          >
            <p className="text-base font-medium text-slate-900 dark:text-slate-100 mb-3">
              {example.prompt}
            </p>
            <div className="flex gap-2">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                {example.type} app
              </span>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                {example.theme} theme
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
