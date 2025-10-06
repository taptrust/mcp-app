'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Import the JSON file directly
import examplePrompts from '../example-app-prompts.json';

// Import all example JSON files
import customerSatisfaction from '../examples/customer-satisfaction.json';
import eventRegistration from '../examples/event-registration.json';
import projectTimeline from '../examples/project-timeline.json';
import salesDashboard from '../examples/sales-dashboard.json';
import smartFitnessWatch from '../examples/smart-fitness-watch.json';

// Map of example IDs to their imported JSON data
const exampleDataMap: Record<string, any> = {
  'customer-satisfaction': customerSatisfaction,
  'event-registration': eventRegistration,
  'project-timeline': projectTimeline,
  'sales-dashboard': salesDashboard,
  'smart-fitness-watch': smartFitnessWatch
};

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
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Flatten all examples from different categories into a single array
  const allExamples = (() => {
    const examples: ExamplePrompt[] = [];
    
    // Helper to add examples from a category
    const addExamples = (category: string, items: any[]) => {
      if (Array.isArray(items)) {
        items.forEach(item => {
          examples.push({
            ...item,
            category: category
          });
        });
      }
    };

    // Add examples from each category
    Object.entries(examplePrompts).forEach(([category, items]) => {
      addExamples(category, items);
    });

    return examples;
  })();

  const handleSelect = async (example: ExamplePrompt) => {
    try {
      setLoading(example.id);
      setError(null);
      
      // Get the example data from our imported JSON files
      const exampleData = exampleDataMap[example.id];
      
      if (!exampleData) {
        throw new Error(`Example data not found for ${example.id}`);
      }
      
      // Convert the data to a JSON string
      const resourceContent = JSON.stringify(exampleData, null, 2);
      onSelect(example.id, resourceContent);
    } catch (err) {
      console.error('Error loading example resource:', err);
      setError(`Failed to load example: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  };

  // Auto-select the first example on initial render
  useEffect(() => {
    if (allExamples.length > 0) {
      handleSelect(allExamples[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
        {allExamples.map((example) => (
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