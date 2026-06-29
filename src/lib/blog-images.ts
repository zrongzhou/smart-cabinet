// Shared blog image mapping utility
// Ensures all blog images use reliable local files instead of API URLs

import { BlogPost } from './api';

// All available local blog images
export const allBlogImages = [
  '/images/blog/industry-trends.jpg',
  '/images/blog/case-study.jpg',
  '/images/blog/technical-guide.jpg',
  '/images/blog/best-practice.jpg',
  '/images/blog/use-case.jpg',
  '/images/blog/customer-story.jpg',
  '/images/blog/general.jpg',
  '/images/blog/smart-cabinet-warehouse.jpg',
  '/images/blog/roi-cost-analysis.jpg',
  '/images/blog/rfid-tool-tracking.jpg',
  '/images/blog/iot-mes-integration.jpg',
  '/images/blog/cnc-machining-roi.jpg',
  '/images/blog/aerospace-fod-prevention.jpg',
  '/images/blog/ai-industry-4-0.jpg',
  '/images/blog/digital-transformation.jpg',
  '/images/blog/future-smart-factory.jpg',
  '/images/blog/ppe-safety-equipment.jpg',
  '/images/blog/buying-guide-smart-cabinet.jpg',
];

// Category-specific local images (Title Case keys for display)
const categoryImageMap: Record<string, string> = {
  'Industry Trends': '/images/blog/industry-trends.jpg',
  'Case Study': '/images/blog/case-study.jpg',
  'Technical Guide': '/images/blog/technical-guide.jpg',
  'Best Practice': '/images/blog/best-practice.jpg',
  'Use Case': '/images/blog/use-case.jpg',
  'Customer Story': '/images/blog/customer-story.jpg',
  'General': '/images/blog/general.jpg',
};

// Normalize API category to Title Case
// API may return 'industry-trends' or 'Industry Trends'
export function normalizeCategory(category: string): string {
  if (!category) return 'General';
  
  // If already Title Case, return directly
  if (categoryImageMap[category]) return category;
  
  // Try to convert from kebab-case or snake_case to Title Case
  // e.g., 'industry-trends' → 'Industry Trends'
  const normalized = category
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  if (categoryImageMap[normalized]) return normalized;
  
  // Try with spaces already (e.g., 'industry trends')
  const withSpaces = category
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  if (categoryImageMap[withSpaces]) return withSpaces;
  
  // Fallback: try case-insensitive match
  const lowerCategory = category.toLowerCase();
  for (const key of Object.keys(categoryImageMap)) {
    if (key.toLowerCase() === lowerCategory) return key;
  }
  
  return 'General';
}

// Topic-specific local images (matched by slug keywords)
const topicImageMap: Record<string, string> = {
  'smart-cabinet-warehouse': '/images/blog/smart-cabinet-warehouse.jpg',
  'roi-cost-analysis': '/images/blog/roi-cost-analysis.jpg',
  'rfid-tool-tracking': '/images/blog/rfid-tool-tracking.jpg',
  'iot-mes-integration': '/images/blog/iot-mes-integration.jpg',
  'cnc-machining-roi': '/images/blog/cnc-machining-roi.jpg',
  'aerospace-fod-prevention': '/images/blog/aerospace-fod-prevention.jpg',
  'ai-industry-4-0': '/images/blog/ai-industry-4-0.jpg',
  'digital-transformation': '/images/blog/digital-transformation.jpg',
  'future-smart-factory': '/images/blog/future-smart-factory.jpg',
  'ppe-safety-equipment': '/images/blog/ppe-safety-equipment.jpg',
  'buying-guide': '/images/blog/buying-guide-smart-cabinet.jpg',
  'tool-security-audit': '/images/blog/tool-security-audit.jpg',
};

/**
 * Get the best local image for a blog post
 * Priority: 1) slug keyword match → 2) normalized category match → 3) index-based rotation → 4) default
 */
export function getBlogImage(post: BlogPost, index?: number): string {
  // 1. Try topic-specific image match by slug
  const slug = post.slug || '';
  for (const [key, img] of Object.entries(topicImageMap)) {
    if (slug.includes(key)) {
      return img;
    }
  }
  
  // 2. Try normalized category match
  const normalizedCategory = normalizeCategory(post.category || 'General');
  const categoryImage = categoryImageMap[normalizedCategory];
  if (categoryImage) return categoryImage;
  
  // 3. Fallback: use index-based rotation to ensure variety
  if (index !== undefined) {
    return allBlogImages[index % allBlogImages.length];
  }
  
  // 4. Ultimate fallback
  return categoryImageMap['General'];
}

/**
 * Get image for detail page (always returns a valid local image)
 */
export function getBlogDetailImage(post: BlogPost): string {
  // Try slug match first
  const slug = post.slug || '';
  for (const [key, img] of Object.entries(topicImageMap)) {
    if (slug.includes(key)) {
      return img;
    }
  }
  
  // Then try category
  const normalizedCategory = normalizeCategory(post.category || 'General');
  const categoryImage = categoryImageMap[normalizedCategory];
  if (categoryImage) return categoryImage;
  
  // Fallback to general
  return categoryImageMap['General'];
}
