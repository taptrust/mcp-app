import { createUIResource } from "@mcp-ui/server";
import type { AppConfig } from '../validators/config-validator';

export interface VisualizationContext {
  event?: string;
  data?: Record<string, any>;
  surveyId?: string;
}

/**
 * Renders a visualization as an MCP-UI resource
 */
export async function renderVisualization(
  config: AppConfig,
  visualizationId: string,
  context?: VisualizationContext
): Promise<any> {
  const visualization = config.visualizations?.[visualizationId];

  if (!visualization) {
    throw new Error(`Visualization with ID "${visualizationId}" not found in configuration`);
  }

  // Check if visualization should be shown
  if (!shouldShowVisualization(visualization, context)) {
    return null;
  }

  // Generate a unique URI for this visualization instance
  const uniqueUri = `ui://visualization/${visualizationId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as `ui://${string}`;

  // Build visualization HTML based on type
  let visualizationHtml: string;

  switch (visualization.type) {
    case 'chart':
      visualizationHtml = buildChartHtml(visualization, context);
      break;
    case 'metrics':
      visualizationHtml = buildMetricsHtml(visualization, context);
      break;
    case 'table':
      visualizationHtml = buildTableHtml(visualization, context);
      break;
    case 'custom':
      visualizationHtml = buildCustomHtml(visualization, context);
      break;
    default:
      throw new Error(`Unsupported visualization type: ${visualization.type}`);
  }

  const resource = createUIResource({
    uri: uniqueUri,
    content: {
      type: 'rawHtml',
      htmlString: visualizationHtml,
    },
    encoding: 'text',
    uiMetadata: {
      'preferred-frame-size': ['100%', '600px'],
    },
  });

  return resource;
}

/**
 * Determines if a visualization should be shown
 */
function shouldShowVisualization(visualization: any, context?: VisualizationContext): boolean {
  // Manual trigger - only show when no event context is provided
  if (visualization.trigger === 'manual') {
    return !context?.event;
  }

  // Check if trigger matches context event
  if (context?.event) {
    const triggerMap: Record<string, string> = {
      'survey_complete': 'survey_complete',
      'message_received': 'message_received',
    };

    if (visualization.trigger !== triggerMap[context.event]) {
      return false;
    }
  }

  // Check condition if present
  if (visualization.condition) {
    try {
      return evaluateCondition(visualization.condition, context?.data || {}, context?.surveyId);
    } catch (error) {
      console.error(`Error evaluating visualization condition: ${error}`);
      return false;
    }
  }

  return true;
}

/**
 * Simple condition evaluator
 */
function evaluateCondition(condition: string, data: Record<string, any>, surveyId?: string): boolean {
  // Simple condition check for surveyId === 'some-id'
  if (condition.includes('surveyId ===') && surveyId) {
    const match = condition.match(/surveyId\s*===\s*['"]([^'"]+)['"]/);
    if (match) {
      return surveyId === match[1];
    }
  }

  console.warn('Condition evaluation not fully implemented:', condition);
  return true;
}

/**
 * Builds HTML for chart visualization
 */
function buildChartHtml(visualization: any, context?: VisualizationContext): string {
  const chartType = visualization.config?.chartType || 'bar';
  const colors = visualization.config?.colors || ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6'];

  // Sample data for demonstration
  const sampleData = {
    labels: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
    values: [12, 19, 8, 15, 10]
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(visualization.title)}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .visualization-container {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }
    .description {
      color: #666;
      margin-bottom: 24px;
    }
    canvas {
      max-height: 400px;
    }
  </style>
</head>
<body>
  <div class="visualization-container">
    <h1>${escapeHtml(visualization.title)}</h1>
    ${visualization.description ? `<p class="description">${escapeHtml(visualization.description)}</p>` : ''}
    <canvas id="chart"></canvas>
  </div>
  <script>
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
      type: '${chartType}',
      data: {
        labels: ${JSON.stringify(sampleData.labels)},
        datasets: [{
          label: 'Responses',
          data: ${JSON.stringify(sampleData.values)},
          backgroundColor: ${JSON.stringify(colors)},
          borderColor: ${JSON.stringify(colors)},
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: ${chartType === 'pie'}
          }
        }
      }
    });
  </script>
</body>
</html>
  `.trim();
}

/**
 * Builds HTML for metrics dashboard
 */
function buildMetricsHtml(visualization: any, context?: VisualizationContext): string {
  const metrics = visualization.config?.metrics || [];

  const metricsHtml = metrics.map((metric: any) => `
    <div class="metric-card">
      <div class="metric-value">${getSampleMetricValue(metric.field, metric.format)}</div>
      <div class="metric-label">${escapeHtml(metric.label)}</div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(visualization.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .visualization-container {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }
    .description {
      color: #666;
      margin-bottom: 24px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .metric-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .metric-value {
      font-size: 36px;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 8px;
    }
    .metric-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="visualization-container">
    <h1>${escapeHtml(visualization.title)}</h1>
    ${visualization.description ? `<p class="description">${escapeHtml(visualization.description)}</p>` : ''}
    <div class="metrics-grid">
      ${metricsHtml}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds HTML for table visualization
 */
function buildTableHtml(visualization: any, context?: VisualizationContext): string {
  // Sample table data
  const sampleData = [
    { id: 1, name: 'John Doe', score: 85, status: 'Complete' },
    { id: 2, name: 'Jane Smith', score: 92, status: 'Complete' },
    { id: 3, name: 'Bob Johnson', score: 78, status: 'Incomplete' },
  ];

  const headers = Object.keys(sampleData[0]);
  const rows = sampleData.map(row =>
    `<tr>${headers.map(header => `<td>${escapeHtml(String(row[header as keyof typeof row]))}</td>`).join('')}</tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(visualization.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .visualization-container {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }
    .description {
      color: #666;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }
    tr:hover {
      background: #f8f9fa;
    }
  </style>
</head>
<body>
  <div class="visualization-container">
    <h1>${escapeHtml(visualization.title)}</h1>
    ${visualization.description ? `<p class="description">${escapeHtml(visualization.description)}</p>` : ''}
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds HTML for custom visualization
 */
function buildCustomHtml(visualization: any, context?: VisualizationContext): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(visualization.title)}</title>
</head>
<body>
  <h1>${escapeHtml(visualization.title)}</h1>
  <p>Custom visualization (not yet implemented)</p>
</body>
</html>
  `.trim();
}

/**
 * Gets a sample value for a metric field
 */
function getSampleMetricValue(field: string, format?: string): string {
  // Sample values based on field name
  const sampleValues: Record<string, any> = {
    'rating': 4.5,
    'satisfaction_rating': 4.2,
    'response_count': 47,
    'completion_rate': 0.85,
    'average': 78.5,
  };

  const value = sampleValues[field] || Math.floor(Math.random() * 100);

  if (format === 'percentage') {
    return `${(value * 100).toFixed(0)}%`;
  }
  if (format === 'rating') {
    return `${value.toFixed(1)} ★`;
  }
  if (format === 'number') {
    return String(Math.floor(value));
  }

  return String(value);
}

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
