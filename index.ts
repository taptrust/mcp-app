// Main exports for @MCP-APP/server
// export { default as generateApp } from './tools/generate_app';
export { generateMCPUIResource } from './lib/mcp-app-agent';

// Export all types and utilities
export * from './lib/validators/config-validator';
export * from './lib/renderers/survey-renderer';
export * from './lib/renderers/visualization-renderer';
export * from './lib/utils/lifecycle-processor';
export * from './lib/renderers/product-card-renderer';
export * from './lib/validators/product-card-validator';
export * from './lib/utils/plugin-system';
export * from './lib/utils/tool-examples';
