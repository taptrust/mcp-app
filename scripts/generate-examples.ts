#!/usr/bin/env tsx
/**
 * Script to generate MCP-UI resources from example prompts
 *
 * This script:
 * 1. Reads example prompts from example-app-prompts.json
 * 2. Uses the MCP-APP agent to generate resources
 * 3. Saves the generated resources to the examples directory
 * 4. Creates a mapping of prompts to generated resource files
 *
 * Usage: pnpm generate-examples
 *
 * Requirements:
 * - Environment variables must be configured (see .env.example)
 * - MCP_APP_API_KEY must be set for authentication
 * - At least one AI provider API key must be configured
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateMCPUIResource } from '../lib/mcp-app-agent.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ExamplePrompt {
  id: string;
  prompt: string;
  type?: 'survey' | 'visualization' | 'product';
  theme?: string;
  description: string;
  category: string;
}

async function generateAllExamples() {
  try {
    console.log('🚀 Starting example generation...\n');

    // Verify environment variables
    if (!process.env.MCP_APP_API_KEY) {
      console.error('❌ Error: MCP_APP_API_KEY environment variable is required');
      console.error('Please set it in your .env file');
      process.exit(1);
    }

    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
      console.error('❌ Error: At least one AI provider API key is required');
      console.error('Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in your .env file');
      process.exit(1);
    }

    // Read example prompts
    const promptsPath = join(__dirname, '..', 'example-app-prompts.json');
    if (!existsSync(promptsPath)) {
      console.error(`❌ Error: example-app-prompts.json not found at ${promptsPath}`);
      process.exit(1);
    }

    const promptsData = JSON.parse(readFileSync(promptsPath, 'utf-8'));

    // Create examples directory in public folder for Next.js access
    const examplesDir = join(__dirname, '..', 'public', 'examples');
    mkdirSync(examplesDir, { recursive: true });

    // Generate resources for each prompt
    const results: Record<string, string> = {};
    let successCount = 0;
    let errorCount = 0;

    for (const [category, prompts] of Object.entries(promptsData)) {
      console.log(`📂 Processing ${category}...`);

      for (const promptData of prompts as ExamplePrompt[]) {
        try {
          console.log(`  📝 Generating: ${promptData.id}`);
          console.log(`     Prompt: "${promptData.prompt}"`);
          if (promptData.type) console.log(`     Type: ${promptData.type}`);
          if (promptData.theme) console.log(`     Theme: ${promptData.theme}`);

          const resource = await generateMCPUIResource(
            promptData.prompt,
            promptData.type,
            promptData.theme
          );

          if (resource) {
            // Create filename from prompt ID
            const filename = `${promptData.id}.json`;
            const filepath = join(examplesDir, filename);

            // Save the resource
            writeFileSync(filepath, resource, 'utf-8');

            // Store mapping
            results[promptData.id] = filename;

            console.log(`  ✅ Saved: ${filename}\n`);
            successCount++;
          } else {
            console.log(`  ⚠️  No resource generated for: ${promptData.id}`);
            console.log(`     This is expected if the prompt doesn't match supported app types\n`);
            errorCount++;
          }
        } catch (error) {
          console.error(`  ❌ Error generating ${promptData.id}:`, error);
          console.error('');
          errorCount++;
        }
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Example generation complete!');
    console.log(`✅ Successfully generated: ${successCount} resources`);
    if (errorCount > 0) {
      console.log(`⚠️  Failed or skipped: ${errorCount} resources`);
    }
    console.log(`📁 Resources saved to: ${examplesDir}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Fatal error generating examples:', error);
    process.exit(1);
  }
}

// Run the generation
generateAllExamples();
