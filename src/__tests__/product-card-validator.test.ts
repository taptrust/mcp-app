import { validateProductCard, validateProductCardCollection } from '../../lib/validators/product-card-validator';

describe('Product Card Validator', () => {
  describe('validateProductCard', () => {
    it('should validate a minimal valid product card', () => {
      const validCard = {
        id: 'PRODUCT-001',
        title: 'Test Product',
        description: 'A test product description',
        link: 'https://example.com/product',
        image_link: 'https://example.com/image.jpg',
        price: '99.99 USD',
        availability: 'in_stock' as const,
      };

      const result = validateProductCard(validCard);
      expect(result.success).toBe(true);
    });

    it('should validate a product card with sale price', () => {
      const validCard = {
        id: 'PRODUCT-002',
        title: 'Sale Product',
        description: 'A product on sale',
        link: 'https://example.com/product',
        image_link: 'https://example.com/image.jpg',
        price: '99.99 USD',
        sale_price: '79.99 USD',
        availability: 'in_stock' as const,
      };

      const result = validateProductCard(validCard);
      expect(result.success).toBe(true);
    });

    it('should reject invalid price format', () => {
      const invalidCard = {
        id: 'PRODUCT-003',
        title: 'Invalid Product',
        description: 'Invalid price format',
        link: 'https://example.com/product',
        image_link: 'https://example.com/image.jpg',
        price: 'invalid price',
        availability: 'in_stock' as const,
      };

      const result = validateProductCard(invalidCard);
      expect(result.success).toBe(false);
    });

    it('should require availability_date when availability is preorder', () => {
      const invalidCard = {
        id: 'PRODUCT-004',
        title: 'Preorder Product',
        description: 'Missing availability date',
        link: 'https://example.com/product',
        image_link: 'https://example.com/image.jpg',
        price: '99.99 USD',
        availability: 'preorder' as const,
      };

      const result = validateProductCard(invalidCard);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.path.includes('availability_date'))).toBe(true);
      }
    });

    it('should validate OpenAI product feed spec fields', () => {
      const openAICard = {
        // OpenAI Flags
        enable_search: true,
        enable_checkout: true,

        // Basic Product Data
        id: 'SHOE-001',
        title: 'Trail Running Shoes',
        description: 'Waterproof trail shoes',
        link: 'https://example.com/shoes',

        // Media
        image_link: 'https://example.com/shoe.jpg',

        // Price
        price: '79.99 USD',
        sale_price: '59.99 USD',

        // Availability
        availability: 'in_stock' as const,
        inventory_quantity: 50,

        // Item Information
        brand: 'TrailMaster',
        product_category: 'Apparel & Accessories > Shoes',

        // Reviews
        product_review_count: 127,
        product_review_rating: 4.5,

        // Variants
        color: 'Blue',
        size: '10',
      };

      const result = validateProductCard(openAICard);
      expect(result.success).toBe(true);
    });
  });

  describe('validateProductCardCollection', () => {
    it('should validate a collection of product cards', () => {
      const collection = {
        'product-1': {
          id: 'PRODUCT-001',
          title: 'Product 1',
          description: 'First product',
          link: 'https://example.com/product-1',
          image_link: 'https://example.com/image-1.jpg',
          price: '99.99 USD',
          availability: 'in_stock' as const,
        },
        'product-2': {
          id: 'PRODUCT-002',
          title: 'Product 2',
          description: 'Second product',
          link: 'https://example.com/product-2',
          image_link: 'https://example.com/image-2.jpg',
          price: '149.99 USD',
          availability: 'in_stock' as const,
        },
      };

      const result = validateProductCardCollection(collection);
      expect(result.success).toBe(true);
    });
  });
});
