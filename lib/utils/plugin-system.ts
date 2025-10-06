/**
 * Plugin System for MCP-APP
 *
 * Allows extensions to register custom components without modifying core code.
 * This enables WithAI and other projects to add commerce-specific components.
 */

import type { AppConfig } from '../validators/config-validator';

/**
 * Component renderer function signature
 */
export type ComponentRenderer = (
  config: AppConfig,
  componentId: string,
  context?: ComponentContext
) => Promise<any>;

/**
 * Context passed to component renderers
 */
export interface ComponentContext {
  event?: string;
  data?: Record<string, any>;
}

/**
 * Plugin interface
 */
export interface Plugin {
  name: string;
  version: string;

  /**
   * Called when plugin is initialized
   */
  onInit?(registry: ComponentRegistry): void;

  /**
   * Called when config is loaded
   */
  onConfigLoad?(config: AppConfig): void;

  /**
   * Called before rendering
   */
  onRender?(type: string, componentId: string, context?: ComponentContext): any;

  /**
   * Called when an error occurs
   */
  onError?(error: Error): void;
}

/**
 * Component Registry
 *
 * Central registry for all component renderers (built-in and plugin-provided)
 */
export class ComponentRegistry {
  private renderers = new Map<string, ComponentRenderer>();
  private plugins: Plugin[] = [];

  /**
   * Register a component renderer
   */
  register(type: string, renderer: ComponentRenderer): void {
    if (this.renderers.has(type)) {
      console.warn(`Component type "${type}" is already registered. Overwriting.`);
    }
    this.renderers.set(type, renderer);
  }

  /**
   * Get a component renderer by type
   */
  getRenderer(type: string): ComponentRenderer | undefined {
    return this.renderers.get(type);
  }

  /**
   * Check if a component type is registered
   */
  hasRenderer(type: string): boolean {
    return this.renderers.has(type);
  }

  /**
   * Get all registered component types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.renderers.keys());
  }

  /**
   * Register a plugin
   */
  registerPlugin(plugin: Plugin): void {
    this.plugins.push(plugin);

    // Call plugin's onInit hook
    if (plugin.onInit) {
      plugin.onInit(this);
    }
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return [...this.plugins];
  }

  /**
   * Notify plugins of config load
   */
  notifyConfigLoad(config: AppConfig): void {
    for (const plugin of this.plugins) {
      if (plugin.onConfigLoad) {
        try {
          plugin.onConfigLoad(config);
        } catch (error) {
          console.error(`Error in plugin "${plugin.name}" onConfigLoad:`, error);
          if (plugin.onError) {
            plugin.onError(error as Error);
          }
        }
      }
    }
  }

  /**
   * Notify plugins before rendering
   */
  notifyRender(type: string, componentId: string, context?: ComponentContext): any {
    for (const plugin of this.plugins) {
      if (plugin.onRender) {
        try {
          const result = plugin.onRender(type, componentId, context);
          if (result !== undefined) {
            return result;
          }
        } catch (error) {
          console.error(`Error in plugin "${plugin.name}" onRender:`, error);
          if (plugin.onError) {
            plugin.onError(error as Error);
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Notify plugins of an error
   */
  notifyError(error: Error): void {
    for (const plugin of this.plugins) {
      if (plugin.onError) {
        try {
          plugin.onError(error);
        } catch (err) {
          console.error(`Error in plugin "${plugin.name}" onError:`, err);
        }
      }
    }
  }
}

/**
 * Global component registry instance
 */
export const componentRegistry = new ComponentRegistry();

/**
 * Register built-in components
 */
export function registerBuiltInComponents(): void {
  // Import and register built-in renderers
  import('../renderers/survey-renderer').then(({ renderSurvey }) => {
    componentRegistry.register('survey', renderSurvey);
  });

  import('../renderers/visualization-renderer').then(({ renderVisualization }) => {
    componentRegistry.register('visualization', renderVisualization);
  });

  import('../renderers/product-card-renderer').then(({ renderProductCard }) => {
    componentRegistry.register('productCard', renderProductCard);
  });
}

// Auto-register built-in components
registerBuiltInComponents();
