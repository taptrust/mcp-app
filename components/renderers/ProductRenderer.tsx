'use client';

import { useState } from 'react';
import { ProductResource } from '@/types/app-resources';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';

interface ProductRendererProps {
  data: ProductResource;
}

export default function ProductRenderer({ data }: ProductRendererProps) {
  // Extract product and styling from data
  const product = data.product || data;
  const styling = data.styling || {};
  
  // Set default values
  const primaryColor = styling?.colorScheme?.primary || '#000000';
  const secondaryColor = styling?.colorScheme?.secondary || '#FFFFFF';
  const [activeTab, setActiveTab] = useState<'features' | 'specs'>('features');

  // Handle price data
  const currentPrice = product.price?.current || (product as any).pricing?.price || (product as any).pricing?.currentPrice || 0;
  const originalPrice = product.price?.original || (product as any).pricing?.previousPrice || (product as any).pricing?.comparison?.[0]?.price || null;

  // Handle CTA data
  const ctaText = product.cta?.text || (product as any).ctaButton?.text || 'Learn More';
  const ctaAction = product.cta?.action || (product as any).ctaButton?.action || '#';

  // Ensure features is an array and handle both string and object formats
  const features = Array.isArray(product.features)
    ? product.features.map(feature =>
        typeof feature === 'string'
          ? feature
          : typeof feature === 'object' && (feature as any).title
            ? `${(feature as any).title}: ${(feature as any).description || ''}`
            : String(feature)
      )
    : [];
    
  // Ensure specifications is an object
  const specifications = product.specifications && typeof product.specifications === 'object'
    ? product.specifications
    : {};

  const discount = originalPrice && currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Dynamic product icon based on product name/category
  const getProductIcon = () => {
    const name = product.name?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';

    // Check for more specific terms first to avoid substring conflicts
    if (name.includes('headphones') || description.includes('headphones') || name.includes('earbuds') || description.includes('earbuds')) {
      return '🎧'; // Headphones emoji
    } else if (name.includes('watch') || description.includes('watch') || name.includes('smartwatch')) {
      return '⌚'; // Watch emoji
    } else if (name.includes('phone') || description.includes('phone') || name.includes('smartphone')) {
      return '📱'; // Phone emoji
    } else if (name.includes('laptop') || description.includes('laptop') || name.includes('computer')) {
      return '💻'; // Laptop emoji
    } else if (name.includes('tablet') || description.includes('tablet')) {
      return '📟'; // Tablet emoji
    } else if (name.includes('camera') || description.includes('camera')) {
      return '📷'; // Camera emoji
    } else if (name.includes('audio') || description.includes('audio') || name.includes('speaker')) {
      return '🔊'; // Audio/Speaker emoji
    } else {
      return '📦'; // Generic product box emoji
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardContent className="p-4 sm:p-6">
           {/* Header Section - Compact */}
           <div className="mb-6">
             {/* Product Info - Compact */}
             <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold mb-1 text-slate-900 dark:text-slate-100 leading-tight">
                {product.name || 'Product Name'}
              </h1>

              {/* Rating - Compact */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500">(128)</span>
              </div>

              {/* Description - Shortened */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                {product.description || 'No description available.'}
              </p>
            </div>
          </div>

          {/* Price Section - Compact */}
          <div className="flex items-baseline gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">${currentPrice}</span>
            {originalPrice && originalPrice > currentPrice && (
              <>
                <span className="text-sm sm:text-base text-slate-400 line-through">${originalPrice}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Tabbed Content - Space Saving */}
          <div className="mb-4">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'features'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Features
              </button>
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'specs'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Specifications
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {activeTab === 'features' && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">Key Features</h3>
                  <div className="grid gap-2">
                    {product.features?.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: `${primaryColor}20` }}>
                          <Check className="h-2.5 w-2.5" style={{ color: primaryColor }} />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'specs' && product.specifications && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">Specifications</h3>
                  <div className="grid grid-cols-1 gap-2">
                     {Object.entries(product.specifications).map(([key, value]) => (
                       <div key={key} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                         <span className="text-sm text-slate-600 dark:text-slate-400 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                         <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                           {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                         </span>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button - Compact */}
          <Button
            className="w-full text-base py-3 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            style={{
              backgroundColor: primaryColor,
              color: secondaryColor,
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
            }}
          >
            {ctaText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
