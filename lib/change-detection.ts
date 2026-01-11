/**
 * Change detection utilities for monitoring competitor websites
 * Implements the change detection algorithm as specified in requirements
 */

import crypto from 'crypto';

import type { MenuItem } from './menu-parser';

export interface WebsiteSnapshot {
  id: string;
  competitorId: string;
  url: string;
  title: string;
  normalizedText: string;
  contentHash: string; // SHA256 hash
  simhash?: string; // SimHash for near-duplicate detection
  menuItems?: MenuItem[]; // Structured menu data (for pizza website)
  createdAt: Date;
}

export interface DetectedChange {
  id: string;
  competitorId: string;
  url: string;
  oldSnapshotId: string;
  newSnapshotId: string;
  changeType: 'product' | 'pricing' | 'other';
  severity: 'low' | 'medium' | 'high';
  beforeExcerpt: string;
  afterExcerpt: string;
  similarityScore: number; // 0-1, where 1 = identical
  diffSummary: string;
  rationale?: string;
  recommendedActions?: string[];
  detectedAt: Date;
}

/**
 * Normalize text for comparison
 * - Lowercase
 * - Collapse whitespace
 * - Remove common boilerplate patterns
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/cookie|privacy|terms|policy/gi, '') // Remove common boilerplate
    .replace(/\d{4}-\d{2}-\d{2}/g, '') // Remove dates
    .replace(/\d{2}:\d{2}:\d{2}/g, '') // Remove times
    .trim();
}

/**
 * Compute SHA256 hash of normalized text
 */
export function computeContentHash(normalizedText: string): string {
  return crypto.createHash('sha256').update(normalizedText).digest('hex');
}

/**
 * Simple text similarity using word overlap (Jaccard similarity)
 * Returns a score between 0 and 1
 */
export function computeSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 2));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 1; // Both empty = identical

  return intersection.size / union.size;
}

/**
 * Create a snapshot of a website
 */
export async function createSnapshot(
  competitorId: string,
  url: string
): Promise<WebsiteSnapshot> {
  try {
    // Fetch website HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Simple text extraction (remove HTML tags, scripts, styles)
    // First, try to extract product-specific content if it's the pizza demo site
    let text = '';
    let menuItems: MenuItem[] | undefined = undefined;
    
    if (url.includes('pizza-website')) {
      // Parse structured menu data
      const { parsePizzaMenu } = await import('./menu-parser');
      menuItems = parsePizzaMenu(html);
      
      // Also extract text for backward compatibility
      const productMatches = html.match(/<h3[^>]*class="product-name"[^>]*>([^<]+)<\/h3>/gi);
      const descMatches = html.match(/<p[^>]*class="product-description"[^>]*>([^<]+)<\/p>/gi);
      const priceMatches = html.match(/<span[^>]*class="product-price[^"]*"[^>]*>([^<]+)<\/span>/gi);
      
      if (productMatches && productMatches.length > 0) {
        const products = productMatches.map(m => m.replace(/<[^>]+>/g, '').trim()).join(' ');
        const descriptions = descMatches ? descMatches.map(m => m.replace(/<[^>]+>/g, '').trim()).join(' ') : '';
        const prices = priceMatches ? priceMatches.map(m => m.replace(/<[^>]+>/g, '').trim()).join(' ') : '';
        text = `${products} ${descriptions} ${prices}`.trim();
      }
    }
    
    // Fallback to full text extraction if product extraction didn't work
    if (!text) {
      text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Normalize text (limit to first 50000 chars to avoid huge snapshots)
    const truncatedText = text.substring(0, 50000);
    const normalizedText = normalizeText(truncatedText);

    // Compute hash
    const contentHash = computeContentHash(normalizedText);

    // Create snapshot
    const snapshot: WebsiteSnapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      competitorId,
      url,
      title,
      normalizedText,
      contentHash,
      menuItems, // Include structured menu data if parsed
      createdAt: new Date(),
    };

    return snapshot;
  } catch (error) {
    console.error('Error creating snapshot:', error);
    throw error;
  }
}

/**
 * Detect changes between two snapshots
 * Returns null if no significant change detected
 */
export function detectChange(
  oldSnapshot: WebsiteSnapshot,
  newSnapshot: WebsiteSnapshot,
  threshold: number = 0.95 // If similarity < 0.95, consider it a change (raised to 0.95 to detect smaller changes)
): DetectedChange | null {
  // If content hash matches exactly, no change
  if (oldSnapshot.contentHash === newSnapshot.contentHash) {
    console.log(`🔍 Content hash identical - no change detected`);
    return null;
  }

  // Compute similarity
  const similarity = computeSimilarity(oldSnapshot.normalizedText, newSnapshot.normalizedText);
  console.log(`🔍 Similarity: ${(similarity * 100).toFixed(1)}% (threshold: ${(threshold * 100).toFixed(1)}%)`);

  // If similarity is above threshold, no significant change
  if (similarity >= threshold) {
    console.log(`🔍 Similarity above threshold - no significant change`);
    return null;
  }
  
  console.log(`🚨 Change detected! Similarity: ${(similarity * 100).toFixed(1)}% is below threshold ${(threshold * 100).toFixed(1)}%`);

  // Extract excerpts showing the change (use full normalized text for better detection)
  const beforeExcerpt = oldSnapshot.normalizedText;
  const afterExcerpt = newSnapshot.normalizedText;

  // Determine change type and severity (will be enhanced with LLM classification)
  const changeType: 'product' | 'pricing' | 'other' = classifyChangeType(
    beforeExcerpt,
    afterExcerpt
  );

  // Generate a more specific diff summary
  let diffSummary = `Content changed (similarity: ${(similarity * 100).toFixed(1)}%)`;
  
  // Try to extract specific change information for better descriptions
  if (changeType === 'product') {
    // Try to find new product names (words in afterExcerpt but not in beforeExcerpt)
    const beforeWords = new Set(beforeExcerpt.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const afterWords = afterExcerpt.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const newWords = afterWords.filter(w => !beforeWords.has(w));
    
    // Skip common words and prices
    const commonWords = ['the', 'and', 'with', 'for', 'from', 'that', 'this', 'san', 'marzano', 'fresh', 'buffalo', 'garden', 'olive', 'double', 'layer', 'spicy', 'blend', 'oregano', 'chili', 'flakes', 'roasted', 'wild', 'white', 'truffle', 'oil', 'parmesan', 'cream', 'sauce', 'thyme', 'peppers', 'mushrooms', 'olives', 'mozzarella', 'pepperoni', 'sausage', 'ham', 'bacon', 'chicken', 'blue', 'cheese', 'bbq', 'red', 'onions', 'pineapple', 'cheddar', 'gorgonzola'];
    
    // Filter out prices and common words
    const productCandidates = newWords.filter(w => {
      if (commonWords.includes(w)) return false;
      if (/^\$\d+\.?\d*$/.test(w)) return false; // Skip prices (must start with $)
      return w.length > 3; // Product names are usually 4+ chars
    });
    
    if (productCandidates.length > 0) {
      // Try to find product name as a phrase (2-3 words together)
      const afterWordsList = afterExcerpt.toLowerCase().split(/\s+/);
      const newWordsSet = new Set(newWords.filter(w => !commonWords.includes(w) && !/^\$\d+\.?\d*$/.test(w)));
      
      // Look for consecutive new words (likely product name)
      let productName = '';
      for (let i = 0; i < afterWordsList.length - 1; i++) {
        if (newWordsSet.has(afterWordsList[i]) && newWordsSet.has(afterWordsList[i + 1])) {
          // Found a phrase, get original capitalization
          const phraseLower = afterWordsList[i] + ' ' + afterWordsList[i + 1];
          const afterMatch = afterExcerpt.match(new RegExp(`\\b${afterWordsList[i]}\\s+${afterWordsList[i + 1]}\\w*`, 'i'));
          if (afterMatch) {
            productName = afterMatch[0];
            break;
          }
        }
      }
      
      // If no phrase found, use first significant word
      if (!productName && productCandidates.length > 0) {
        const firstCandidate = productCandidates[0];
        const afterMatch = afterExcerpt.match(new RegExp(`\\b${firstCandidate}\\w*`, 'i'));
        productName = afterMatch ? afterMatch[0] : firstCandidate;
      }
      
      // Capitalize properly
      productName = productName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      
      diffSummary = `New Menu Item Added: ${productName}`;
    } else {
      diffSummary = 'New Menu Item Added';
    }
  } else if (changeType === 'pricing') {
    // Try to find price changes - extract prices in order
    const priceBefore = beforeExcerpt.match(/\$\d+\.?\d*/g) || [];
    const priceAfter = afterExcerpt.match(/\$\d+\.?\d*/g) || [];
    
    if (priceBefore.length > 0 && priceAfter.length > 0 && priceBefore.length === priceAfter.length) {
      // Find the first price that changed (same number of prices = price update, not addition)
      for (let i = 0; i < priceBefore.length; i++) {
        if (priceBefore[i] !== priceAfter[i]) {
          diffSummary = `Price Updated: ${priceBefore[i]} → ${priceAfter[i]}`;
          break;
        }
      }
      // If no specific price found but it's a pricing change, use generic message
      if (diffSummary === `Content changed (similarity: ${(similarity * 100).toFixed(1)}%)`) {
        diffSummary = 'Price Updated';
      }
    } else if (priceBefore.length > 0 && priceAfter.length > 0) {
      // Different number of prices - might be a price added/changed during product addition
      // Try to find any price difference
      const minLen = Math.min(priceBefore.length, priceAfter.length);
      for (let i = 0; i < minLen; i++) {
        if (priceBefore[i] !== priceAfter[i]) {
          diffSummary = `Price Updated: ${priceBefore[i]} → ${priceAfter[i]}`;
          break;
        }
      }
      if (diffSummary === `Content changed (similarity: ${(similarity * 100).toFixed(1)}%)`) {
        diffSummary = 'Price Updated';
      }
    } else {
      diffSummary = 'Price Updated';
    }
  }

  const severity: 'low' | 'medium' | 'high' = determineSeverity(changeType, similarity);

  return {
    id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    competitorId: oldSnapshot.competitorId,
    url: oldSnapshot.url,
    oldSnapshotId: oldSnapshot.id,
    newSnapshotId: newSnapshot.id,
    changeType,
    severity,
    beforeExcerpt,
    afterExcerpt,
    similarityScore: similarity,
    diffSummary,
    detectedAt: new Date(),
  };
}

/**
 * Classify change type based on keywords (simplified - will be enhanced with LLM)
 */
function classifyChangeType(beforeText: string, afterText: string): 'product' | 'pricing' | 'other' {
  const pricingKeywords = ['$', 'price', 'cost', 'fee', 'pricing', 'discount', 'sale', 'off', '%'];
  const productKeywords = ['new', 'product', 'feature', 'launch', 'introducing', 'available', 'menu item'];

  const combinedText = `${beforeText} ${afterText}`.toLowerCase();

  // Check for product keywords first (highest priority)
  const hasProduct = productKeywords.some(keyword => combinedText.includes(keyword.toLowerCase()));

  // Check if new content was added (likely product) - check this BEFORE price changes
  const beforeWords = new Set(beforeText.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const afterWords = afterText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const newWords = afterWords.filter(w => !beforeWords.has(w));
  
  // If significant new words added (and not just prices), likely product
  // IMPORTANT: Filter out prices to avoid false positives
  const commonWords = ['the', 'and', 'with', 'for', 'from', 'that', 'this', 'san', 'marzano', 'fresh', 'buffalo', 'garden', 'olive', 'double', 'layer', 'spicy', 'blend', 'oregano', 'chili', 'flakes', 'roasted', 'wild', 'white', 'truffle', 'oil', 'parmesan', 'cream', 'sauce', 'thyme', 'peppers', 'mushrooms', 'olives', 'mozzarella', 'pepperoni', 'sausage', 'ham', 'bacon', 'chicken', 'blue', 'cheese', 'bbq', 'red', 'onions', 'pineapple', 'cheddar', 'gorgonzola'];
  const significantNewWords = newWords.filter(w => {
    if (commonWords.includes(w)) return false;
    // Filter out prices (like $14, $15.40, etc.) - must start with $ followed by digits
    if (/^\$\d+\.?\d*$/.test(w)) return false;
    return w.length > 3;
  });
  
  // If product keywords found or significant new words (excluding prices), likely product change
  if (hasProduct || significantNewWords.length > 0) {
    return 'product';
  }

  // Check if prices have changed (only if no new products added)
  const priceBefore = beforeText.match(/\$\d+\.?\d*/g);
  const priceAfter = afterText.match(/\$\d+\.?\d*/g);
  
  if (priceBefore && priceAfter && priceBefore.length === priceAfter.length) {
    // Only check for price changes if arrays are same length (no products added)
    const pricesChanged = priceBefore.some((price, index) => {
      return priceAfter[index] && priceAfter[index] !== price;
    });
    
    if (pricesChanged) {
      return 'pricing';
    }
  }

  // Check for pricing keywords (fallback)
  const hasPricing = pricingKeywords.some(keyword => combinedText.includes(keyword.toLowerCase()));

  // If prices are present but no new content, likely pricing change
  if (hasPricing) return 'pricing';
  
  // Default to other if unclear
  return 'other';
}

/**
 * Determine severity based on change type and similarity
 */
function determineSeverity(
  changeType: 'product' | 'pricing' | 'other',
  similarity: number
): 'low' | 'medium' | 'high' {
  // Low similarity = high severity
  const severityScore = 1 - similarity;

  if (changeType === 'pricing' || severityScore > 0.3) {
    return 'high';
  } else if (changeType === 'product' || severityScore > 0.15) {
    return 'medium';
  } else {
    return 'low';
  }
}
