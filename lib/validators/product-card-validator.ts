import { z } from 'zod';

/**
 * Product Card Validation Schema
 *
 * Based on OpenAI's Product Feed Specification
 * Validates product card configurations for MCP rendering
 */

const ProductAvailabilitySchema = z.enum(['in_stock', 'out_of_stock', 'preorder']);
const ProductConditionSchema = z.enum(['new', 'refurbished', 'used']);
const AgeGroupSchema = z.enum(['newborn', 'infant', 'toddler', 'kids', 'adult']);
const GenderSchema = z.enum(['male', 'female', 'unisex']);
const PickupMethodSchema = z.enum(['in_store', 'reserve', 'not_supported']);
const RelationshipTypeSchema = z.enum([
  'part_of_set',
  'required_part',
  'often_bought_with',
  'substitute',
  'different_brand',
  'accessory'
]);
const DisplayModeSchema = z.enum(['card', 'list', 'compact']);

/**
 * Validates price format: "79.99 USD"
 */
const priceRegex = /^\d+(\.\d{1,2})?\s+[A-Z]{3}$/;

/**
 * Product Card Schema
 */
export const ProductCardSchema = z.object({
  // OpenAI Flags
  enable_search: z.boolean().optional(),
  enable_checkout: z.boolean().optional(),

  // Basic Product Data (Required)
  id: z.string().max(100),
  title: z.string().max(150),
  description: z.string().max(5000),
  link: z.string().url(),

  // Media (Required)
  image_link: z.string().url(),
  additional_image_link: z.array(z.string().url()).optional(),
  video_link: z.string().url().optional(),
  model_3d_link: z.string().url().optional(),

  // Price & Promotions (Required)
  price: z.string().regex(priceRegex, 'Price must be in format "79.99 USD"'),
  currency: z.string().length(3).optional(),
  applicable_taxes_fees: z.string().optional(),
  sale_price: z.string().regex(priceRegex).optional(),
  sale_price_effective_date: z.string().optional(), // ISO 8601 date range
  pricing_trend: z.string().max(80).optional(),

  // Availability & Inventory (Required)
  availability: ProductAvailabilitySchema,
  availability_date: z.string().optional(), // ISO 8601
  inventory_quantity: z.number().int().nonnegative().optional(),

  // Item Information
  gtin: z.string().regex(/^\d{8,14}$/).optional(), // 8-14 digits
  mpn: z.string().max(70).optional(),
  condition: ProductConditionSchema.optional(),
  product_category: z.string().optional(),
  brand: z.string().max(70).optional(),
  material: z.string().max(100).optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  age_group: AgeGroupSchema.optional(),

  // Reviews and Q&A
  product_review_count: z.number().int().nonnegative().optional(),
  product_review_rating: z.number().min(0).max(5).optional(),
  store_review_count: z.number().int().nonnegative().optional(),
  store_review_rating: z.number().min(0).max(5).optional(),
  q_and_a: z.string().optional(),

  // Variants
  item_group_id: z.string().max(70).optional(),
  item_group_title: z.string().max(150).optional(),
  color: z.string().max(40).optional(),
  size: z.string().max(20).optional(),
  size_system: z.string().length(2).optional(), // ISO 3166 country code
  gender: GenderSchema.optional(),
  offer_id: z.string().optional(),

  // Custom Variants
  custom_variant1_category: z.string().optional(),
  custom_variant1_option: z.string().optional(),
  custom_variant2_category: z.string().optional(),
  custom_variant2_option: z.string().optional(),
  custom_variant3_category: z.string().optional(),
  custom_variant3_option: z.string().optional(),

  // Fulfillment
  shipping: z.string().optional(),
  delivery_estimate: z.string().optional(),
  pickup_method: PickupMethodSchema.optional(),
  pickup_sla: z.string().optional(),

  // Merchant Info
  seller_name: z.string().max(70).optional(),
  seller_url: z.string().url().optional(),
  seller_privacy_policy: z.string().url().optional(),
  seller_tos: z.string().url().optional(),

  // Returns
  return_policy: z.string().url().optional(),
  return_window: z.number().int().positive().optional(),

  // Performance Signals
  popularity_score: z.number().optional(),
  return_rate: z.number().min(0).max(100).optional(),

  // Compliance
  warning: z.string().optional(),
  warning_url: z.string().url().optional(),
  age_restriction: z.number().int().positive().optional(),

  // Related Products
  related_product_id: z.string().optional(),
  relationship_type: RelationshipTypeSchema.optional(),

  // Display Options (MCP-APP-specific)
  display_mode: DisplayModeSchema.optional().default('card'),
  trigger: z.enum(['manual', 'conversation_start', 'message_received']).optional().default('manual'),
}).refine(
  (data) => {
    // If availability is preorder, availability_date is required
    if (data.availability === 'preorder' && !data.availability_date) {
      return false;
    }
    return true;
  },
  {
    message: 'availability_date is required when availability is "preorder"',
    path: ['availability_date'],
  }
).refine(
  (data) => {
    // If enable_checkout is true, enable_search must also be true
    if (data.enable_checkout && !data.enable_search) {
      return false;
    }
    return true;
  },
  {
    message: 'enable_search must be true when enable_checkout is enabled',
    path: ['enable_search'],
  }
).refine(
  (data) => {
    // If sale_price is provided, it must be less than or equal to price
    if (data.sale_price && data.price) {
      const saleAmount = parseFloat(data.sale_price.split(' ')[0]);
      const regularAmount = parseFloat(data.price.split(' ')[0]);
      if (saleAmount > regularAmount) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'sale_price must be less than or equal to price',
    path: ['sale_price'],
  }
);

/**
 * Product Card Collection Schema
 */
export const ProductCardCollectionSchema = z.record(z.string(), ProductCardSchema);

/**
 * Validates a product card configuration
 */
export function validateProductCard(productCard: unknown) {
  return ProductCardSchema.safeParse(productCard);
}

/**
 * Validates a product card collection
 */
export function validateProductCardCollection(collection: unknown) {
  return ProductCardCollectionSchema.safeParse(collection);
}
