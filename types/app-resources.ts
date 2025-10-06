// Survey App Types

export const APP_TYPES = [
  { id: 'survey', label: 'survey' },
  { id: 'visualization', label: 'visualization' },
  { id: 'product', label: 'product card' },
] as const;
export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'text' | 'choice' | 'multipleChoice';
  prompt: string;
  options?: string[];
  scale?: {
    min: number;
    max: number;
  };
  required?: boolean;
}

export interface SurveyPage {
  id: string;
  title?: string;
  description?: string;
  question: SurveyQuestion;
}

export interface SurveyResource {
  type: 'survey';
  theme: string;
  pages: SurveyPage[];
  progressTracking?: boolean;
  validation?: boolean;
  customizableThemes?: boolean;
}

// Visualization App Types
export interface ChartComponent {
  type: 'chart';
  subtype: 'line' | 'bar' | 'pie' | 'scatter';
  data: {
    source: string;
    fields: {
      x: string;
      y: string;
    };
  };
  options: {
    title: string;
    xAxis?: { title: string };
    yAxis?: { title: string };
  };
}

export interface MetricComponent {
  type: 'metric';
  title: string;
  value: number;
  change?: number;
  format?: 'currency' | 'number' | 'percent';
  icon?: string;
}

export interface VisualizationResource {
  type: 'visualization';
  theme: string;
  metadata?: {
    title: string;
    description: string;
  };
  data?: any;
  components?: (ChartComponent | MetricComponent)[];
  interactions?: Array<{
    type: string;
    target: string;
    options: Record<string, any>;
  }>;
  styling?: {
    colors?: {
      primary: string;
      secondary: string;
    };
    font?: {
      family: string;
      size: string;
    };
  };
  style?: any;
  view?: any;
  interactivity?: any;
  annotations?: any[];
}

// Product App Types
export interface ProductResource {
  type: 'product';
  theme: string;
  product: {
    name: string;
    description: string;
    imageGallery?: string[];
    price: {
      current: number;
      original?: number;
    };
    features: string[];
    specifications?: Record<string, string>;
    cta: {
      text: string;
      action: string;
    };
  };
  styling?: {
    colorScheme?: {
      primary: string;
      secondary: string;
    };
    font?: {
      family: string;
      size: string;
    };
  };
}

// Union type for all app resources
export type AppResource = SurveyResource | VisualizationResource | ProductResource;
