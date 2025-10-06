import { createUIResource } from "@mcp-ui/server";
import type { AppConfig } from '../validators/config-validator';
import type { z } from 'zod';
import { ProductCardSchema } from '../validators/product-card-validator';

type ProductCard = z.infer<typeof ProductCardSchema>;

export interface ProductCardContext {
  event?: string;
  data?: Record<string, any>;
}

/**
 * Renders a product card as an MCP-UI resource
 */
export async function renderProductCard(
  config: AppConfig,
  productCardId: string,
  context?: ProductCardContext
): Promise<any> {
  const productCard = config.productCards?.[productCardId];

  if (!productCard) {
    throw new Error(`Product card with ID "${productCardId}" not found in configuration`);
  }

  // Check if product card should be shown based on trigger and condition
  if (!shouldShowProductCard(productCard, context)) {
    return null;
  }

  // Generate a unique URI for this product card instance
  const uniqueUri = `ui://product-card/${productCardId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as `ui://${string}`;

  // Build product card HTML
  const productCardHtml = buildProductCardHtml(productCard);

  const resource = createUIResource({
    uri: uniqueUri,
    content: {
      type: 'rawHtml',
      htmlString: productCardHtml,
    },
    encoding: 'text',
  });

  return resource;
}

/**
 * Renders multiple product cards (for product listings/grids)
 */
export async function renderProductCards(
  config: AppConfig,
  productCardIds: string[],
  context?: ProductCardContext
): Promise<any> {
  const productCards = productCardIds
    .map(id => config.productCards?.[id])
    .filter(Boolean) as ProductCard[];

  if (productCards.length === 0) {
    throw new Error('No valid product cards found');
  }

  const uniqueUri = `ui://product-cards/${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as `ui://${string}`;

  const html = buildProductGridHtml(productCards);

  const resource = createUIResource({
    uri: uniqueUri,
    content: {
      type: 'rawHtml',
      htmlString: html,
    },
    encoding: 'text',
  });

  return resource;
}

/**
 * Determines if a product card should be shown based on trigger and condition
 */
function shouldShowProductCard(productCard: ProductCard, context?: ProductCardContext): boolean {
  // Manual trigger - only show when no event context is provided
  if (productCard.trigger === 'manual') {
    return !context?.event;
  }

  // Check if trigger matches context event
  if (context?.event) {
    const triggerMap: Record<string, string> = {
      'conversation_start': 'conversation_start',
      'message_received': 'message_received',
    };

    if (productCard.trigger !== triggerMap[context.event]) {
      return false;
    }
  }

  return true;
}

/**
 * Builds HTML for a single product card
 */
function buildProductCardHtml(product: ProductCard): string {
  const displayMode = product.display_mode || 'card';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(product.title)}</title>
  <style>
    ${getProductCardStyles()}
  </style>
</head>
<body>
  <div class="product-container">
    ${buildSingleProductCard(product, displayMode)}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds HTML for a product grid
 */
function buildProductGridHtml(products: ProductCard[]): string {
  const productsHtml = products.map(p => buildSingleProductCard(p, p.display_mode || 'card')).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Products</title>
  <style>
    ${getProductCardStyles()}
  </style>
</head>
<body>
  <div class="product-grid">
    ${productsHtml}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds a single product card HTML
 */
function buildSingleProductCard(product: ProductCard, displayMode: string): string {
  const { price, currency } = parsePrice(product.price);
  const salePrice = product.sale_price ? parsePrice(product.sale_price).price : null;
  const hasDiscount = !!(salePrice && parseFloat(salePrice) < parseFloat(price));

  const availabilityBadge = getAvailabilityBadge(product.availability, product.inventory_quantity);
  const ratingHtml = product.product_review_rating ? buildRatingHtml(product.product_review_rating, product.product_review_count) : '';

  if (displayMode === 'list') {
    return buildListProductCard(product, price, salePrice, currency, hasDiscount, availabilityBadge, ratingHtml);
  } else if (displayMode === 'compact') {
    return buildCompactProductCard(product, price, salePrice, currency, hasDiscount);
  }

  // Default: card mode
  return `
    <div class="product-card">
      <div class="product-image-container">
        <img src="${escapeHtml(product.image_link)}" alt="${escapeHtml(product.title)}" class="product-image" loading="lazy">
        ${availabilityBadge}
        ${hasDiscount ? `<div class="discount-badge">Sale</div>` : ''}
      </div>
      <div class="product-info">
        ${product.brand ? `<div class="product-brand">${escapeHtml(product.brand)}</div>` : ''}
        <h3 class="product-title">${escapeHtml(product.title)}</h3>
        ${ratingHtml}
        <p class="product-description">${truncate(escapeHtml(product.description), 100)}</p>
        <div class="product-pricing">
          ${hasDiscount ? `<span class="product-price-sale">${formatPrice(salePrice!, currency)}</span>` : ''}
          <span class="product-price${hasDiscount ? ' product-price-original' : ''}">${formatPrice(price, currency)}</span>
        </div>
        ${product.pricing_trend ? `<div class="pricing-trend">${escapeHtml(product.pricing_trend)}</div>` : ''}
        ${buildVariantInfo(product)}
        <button class="add-to-cart-btn" onclick="alert('Add to cart: ${escapeHtml(product.id)}')">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

/**
 * Builds list view product card
 */
function buildListProductCard(
  product: ProductCard,
  price: string,
  salePrice: string | null,
  currency: string,
  hasDiscount: boolean,
  availabilityBadge: string,
  ratingHtml: string
): string {
  const salePriceValue = salePrice || price;
  return `
    <div class="product-card-list">
      <div class="product-image-container-list">
        <img src="${escapeHtml(product.image_link)}" alt="${escapeHtml(product.title)}" class="product-image-list" loading="lazy">
        ${hasDiscount ? `<div class="discount-badge">Sale</div>` : ''}
      </div>
      <div class="product-info-list">
        ${product.brand ? `<div class="product-brand">${escapeHtml(product.brand)}</div>` : ''}
        <h3 class="product-title">${escapeHtml(product.title)}</h3>
        ${ratingHtml}
        <p class="product-description-list">${truncate(escapeHtml(product.description), 200)}</p>
        ${buildVariantInfo(product)}
      </div>
      <div class="product-actions-list">
        ${availabilityBadge}
        <div class="product-pricing">
          ${hasDiscount ? `<span class="product-price-sale">${formatPrice(salePriceValue, currency)}</span>` : ''}
          <span class="product-price${hasDiscount ? ' product-price-original' : ''}">${formatPrice(price, currency)}</span>
        </div>
        <button class="add-to-cart-btn" onclick="alert('Add to cart: ${escapeHtml(product.id)}')">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

/**
 * Builds compact view product card
 */
function buildCompactProductCard(
  product: ProductCard,
  price: string,
  salePrice: string | null,
  currency: string,
  hasDiscount: boolean
): string {
  const salePriceValue = salePrice || price;
  return `
    <div class="product-card-compact">
      <img src="${escapeHtml(product.image_link)}" alt="${escapeHtml(product.title)}" class="product-image-compact" loading="lazy">
      <div class="product-info-compact">
        <div class="product-title-compact">${escapeHtml(product.title)}</div>
        <div class="product-pricing-compact">
          ${hasDiscount ? `<span class="product-price-sale">${formatPrice(salePriceValue, currency)}</span>` : ''}
          <span class="product-price${hasDiscount ? ' product-price-original' : ''}">${formatPrice(price, currency)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Builds variant information display
 */
function buildVariantInfo(product: ProductCard): string {
  const variants = [];

  if (product.color) variants.push(`Color: ${escapeHtml(product.color)}`);
  if (product.size) variants.push(`Size: ${escapeHtml(product.size)}`);

  if (variants.length === 0) return '';

  return `<div class="product-variants">${variants.join(' • ')}</div>`;
}

/**
 * Builds rating stars HTML
 */
function buildRatingHtml(rating: number, reviewCount?: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let starsHtml = '★'.repeat(fullStars);
  if (hasHalfStar) starsHtml += '⯨';
  starsHtml += '☆'.repeat(emptyStars);

  const reviewText = reviewCount ? ` (${reviewCount.toLocaleString()} reviews)` : '';

  return `
    <div class="product-rating">
      <span class="rating-stars" title="${rating.toFixed(1)} out of 5">${starsHtml}</span>
      <span class="rating-count">${reviewText}</span>
    </div>
  `;
}

/**
 * Gets availability badge HTML
 */
function getAvailabilityBadge(availability: string, inventory?: number): string {
  if (availability === 'in_stock') {
    const stockText = inventory ? `${inventory} in stock` : 'In Stock';
    return `<div class="availability-badge in-stock">${stockText}</div>`;
  } else if (availability === 'out_of_stock') {
    return `<div class="availability-badge out-of-stock">Out of Stock</div>`;
  } else if (availability === 'preorder') {
    return `<div class="availability-badge preorder">Pre-order</div>`;
  }
  return '';
}

/**
 * Parses price string "79.99 USD" into components
 */
function parsePrice(priceString: string): { price: string; currency: string } {
  const parts = priceString.trim().split(' ');
  return {
    price: parts[0],
    currency: parts[1] || 'USD'
  };
}

/**
 * Formats price for display
 */
function formatPrice(price: string, currency: string): string {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${price}`;
}

/**
 * Truncates text to specified length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Product card CSS styles
 */
function getProductCardStyles(): string {
  return `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }

    .product-container {
      max-width: 400px;
      margin: 0 auto;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Card Mode */
    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .product-image-container {
      position: relative;
      width: 100%;
      padding-top: 100%;
      background: #f9f9f9;
      overflow: hidden;
    }

    .product-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .discount-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #e74c3c;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .availability-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .availability-badge.in-stock {
      background: #27ae60;
      color: white;
    }

    .availability-badge.out-of-stock {
      background: #95a5a6;
      color: white;
    }

    .availability-badge.preorder {
      background: #f39c12;
      color: white;
    }

    .product-info {
      padding: 16px;
    }

    .product-brand {
      font-size: 12px;
      color: #7f8c8d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .product-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #2c3e50;
      line-height: 1.3;
    }

    .product-description {
      font-size: 14px;
      color: #7f8c8d;
      line-height: 1.5;
      margin: 8px 0;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
    }

    .rating-stars {
      color: #f39c12;
      font-size: 16px;
      letter-spacing: 2px;
    }

    .rating-count {
      font-size: 13px;
      color: #7f8c8d;
    }

    .product-pricing {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 12px 0;
    }

    .product-price {
      font-size: 24px;
      font-weight: 700;
      color: #2c3e50;
    }

    .product-price-sale {
      font-size: 24px;
      font-weight: 700;
      color: #e74c3c;
    }

    .product-price-original {
      font-size: 18px;
      font-weight: 400;
      color: #95a5a6;
      text-decoration: line-through;
    }

    .pricing-trend {
      font-size: 12px;
      color: #27ae60;
      margin-bottom: 12px;
    }

    .product-variants {
      font-size: 13px;
      color: #7f8c8d;
      margin: 8px 0;
    }

    .add-to-cart-btn {
      width: 100%;
      padding: 12px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .add-to-cart-btn:hover {
      background: #2980b9;
    }

    /* List Mode */
    .product-card-list {
      background: white;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      gap: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 16px;
    }

    .product-image-container-list {
      position: relative;
      width: 150px;
      height: 150px;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;
      background: #f9f9f9;
    }

    .product-image-list {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-info-list {
      flex: 1;
      min-width: 0;
    }

    .product-description-list {
      font-size: 14px;
      color: #7f8c8d;
      line-height: 1.5;
      margin: 8px 0;
    }

    .product-actions-list {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12px;
    }

    /* Compact Mode */
    .product-card-compact {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 8px;
    }

    .product-image-compact {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .product-info-compact {
      flex: 1;
      min-width: 0;
    }

    .product-title-compact {
      font-size: 14px;
      font-weight: 600;
      color: #2c3e50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }

    .product-pricing-compact {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    @media (max-width: 768px) {
      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }

      .product-card-list {
        flex-direction: column;
      }

      .product-actions-list {
        width: 100%;
        align-items: stretch;
      }

      .product-image-container-list {
        width: 100%;
        height: 200px;
      }
    }
  `;
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
