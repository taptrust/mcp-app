import ProductRenderer from '@/components/renderers/ProductRenderer';

export default function ProductPage() {
  // Static sample product data matching the ProductResource interface
  const sampleData = {
    type: 'product' as const,
    theme: 'space',
    product: {
      name: 'Premium Wireless Headphones',
      description: 'Experience crystal-clear audio with active noise cancellation and 30-hour battery life',
      features: [
        'Active Noise Cancellation',
        '30-hour Battery Life',
        'Bluetooth 5.3',
        'Premium Sound Quality',
        'Comfortable Fit'
      ],
      imageGallery: [
        'headphones_front.jpg',
        'headphones_side.jpg',
        'headphones_folded.jpg'
      ],
      price: {
        current: 299.99,
        original: 349.99
      },
      specifications: {
        'Battery Life': '30 hours',
        'Driver Size': '40mm',
        'Frequency Response': '20Hz - 20kHz',
        'Connectivity': 'Bluetooth 5.3'
      },
      cta: {
        text: 'Buy Now',
        action: 'addToCart'
      }
    },
    styling: {
      colorScheme: {
        primary: '#3b82f6',
        secondary: '#1e40af'
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <ProductRenderer data={sampleData} />
      </div>
    </div>
  );
}
