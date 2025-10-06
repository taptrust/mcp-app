import VisualizationRenderer from '@/components/renderers/VisualizationRenderer';

export default function VisualizationPage() {
  // Static sample visualization data matching the VisualizationResource interface
  const sampleData = {
    type: 'visualization' as const,
    theme: 'ocean',
    metadata: {
      title: 'Q4 Sales Dashboard',
      description: 'Interactive sales performance visualization'
    },
    data: {
      sales_data: [
        { month: 'Oct', revenue: 165000, units: 1600, target: 160000 },
        { month: 'Nov', revenue: 178000, units: 1750, target: 170000 },
        { month: 'Dec', revenue: 192000, units: 1890, target: 185000 }
      ],
      products: [
        { name: 'Product A', revenue: 210000, growth: 15.5 },
        { name: 'Product B', revenue: 185000, growth: 10.2 },
        { name: 'Product C', revenue: 140000, growth: 6.7 }
      ]
    },
    components: [
      {
        type: 'chart' as const,
        subtype: 'line' as const,
        data: {
          source: 'sales_data',
          fields: {
            x: 'month',
            y: 'revenue'
          }
        },
        options: {
          title: 'Monthly Revenue Trends',
          xAxis: { title: 'Month' },
          yAxis: { title: 'Revenue' }
        }
      },
      {
        type: 'metric' as const,
        title: 'Total Revenue',
        value: 535000,
        change: 10.8,
        format: 'currency' as const
      }
    ],
    styling: {
      colors: {
        primary: '#4f46e5',
        secondary: '#818cf8'
      },
      font: {
        family: 'Inter, sans-serif',
        size: '14px'
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <VisualizationRenderer data={sampleData} />
      </div>
    </div>
  );
}
