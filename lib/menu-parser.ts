/**
 * Menu parsing utilities
 * Parses structured menu items from HTML for the pizza website
 */

export interface MenuItem {
  key: string; // Stable identifier (derived from name or ID)
  name: string;
  price: number; // Normalized numeric price
  description?: string;
  productId?: string; // Original product ID if available
}

/**
 * Normalize price string to number
 * Handles: "$14", "$15.40", "14.00", etc.
 */
export function normalizePrice(priceStr: string): number {
  if (!priceStr) return 0;
  
  // Remove currency symbols, commas, spaces
  const cleaned = priceStr.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    console.warn(`⚠️  Failed to parse price: "${priceStr}"`);
    return 0;
  }
  
  return Math.round(parsed * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate stable key from menu item name
 * - Lowercase
 * - Trim and collapse spaces
 * - Remove punctuation
 */
export function generateItemKey(name: string, productId?: string | number): string {
  // If we have a product ID, prefer that as it's most stable
  if (productId !== undefined && productId !== null) {
    return `id-${productId}`;
  }
  
  // Otherwise derive from name
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
}

/**
 * Parse menu items from pizza website HTML
 */
export function parsePizzaMenu(html: string): MenuItem[] {
  const items: MenuItem[] = [];
  
  try {
    // Extract product blocks by finding product divs
    // Each product is wrapped in a div with class "product"
    const productBlockRegex = /<div[^>]*class=["']product["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    const productBlocks: string[] = [];
    let match;
    
    while ((match = productBlockRegex.exec(html)) !== null) {
      productBlocks.push(match[0]);
    }
    
    // If we can't find product blocks, fall back to individual element extraction
    if (productBlocks.length === 0) {
      console.warn('⚠️  Could not find product blocks, using fallback parsing');
      return parsePizzaMenuFallback(html);
    }
    
    console.log(`📋 Found ${productBlocks.length} product blocks`);
    
    for (let i = 0; i < productBlocks.length; i++) {
      const block = productBlocks[i];
      
      // Extract name
      const nameMatch = block.match(/<h3[^>]*class=["']product-name["'][^>]*>([^<]+)<\/h3>/i);
      // Extract price and product ID
      const priceMatch = block.match(/<span[^>]*class=["']product-price[^"']*["'][^>]*data-product-id=["'](\d+)["'][^>]*>([^<]+)<\/span>/i) ||
                        block.match(/<span[^>]*class=["']product-price[^"']*["'][^>]*>([^<]+)<\/span>/i);
      // Extract description
      const descMatch = block.match(/<p[^>]*class=["']product-description["'][^>]*>([^<]+)<\/p>/i);
      
      if (!nameMatch || !priceMatch) {
        console.warn(`⚠️  Missing name or price in product block ${i}`);
        continue;
      }
      
      const name = nameMatch[1].trim();
      const priceStr = priceMatch[priceMatch.length > 2 ? 2 : 1].trim();
      const productId = priceMatch.length > 2 ? priceMatch[1] : undefined;
      const description = descMatch ? descMatch[1].trim() : undefined;
      
      const price = normalizePrice(priceStr);
      
      if (!name || price === 0) {
        console.warn(`⚠️  Skipping invalid item: name="${name}", price="${priceStr}"`);
        continue;
      }
      
      const key = generateItemKey(name, productId);
      
      items.push({
        key,
        name,
        price,
        description,
        productId,
      });
    }
    
    console.log(`✅ Parsed ${items.length} menu items:`, items.map(i => `${i.name} - $${i.price}`).join(', '));
    
    return items;
  } catch (error) {
    console.error('❌ Error parsing menu:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Fallback parser when product blocks aren't found
 */
function parsePizzaMenuFallback(html: string): MenuItem[] {
  const items: MenuItem[] = [];
  
  // Extract product IDs from data-product-id attributes on prices
  const productIdRegex = /data-product-id=["'](\d+)["']/gi;
  const productIdMatches = Array.from(html.matchAll(productIdRegex));
  
  // Extract product names from <h3 class="product-name">
  const nameRegex = /<h3[^>]*class=["']product-name["'][^>]*>([^<]+)<\/h3>/gi;
  const nameMatches = Array.from(html.matchAll(nameRegex));
  
  // Extract prices from <span class="product-price...">
  const priceRegex = /<span[^>]*class=["']product-price[^"']*["'][^>]*>([^<]+)<\/span>/gi;
  const priceMatches = Array.from(html.matchAll(priceRegex));
  
  // Extract descriptions from <p class="product-description">
  const descRegex = /<p[^>]*class=["']product-description["'][^>]*>([^<]+)<\/p>/gi;
  const descMatches = Array.from(html.matchAll(descRegex));
  
  const maxItems = Math.max(nameMatches.length, priceMatches.length);
  
  for (let i = 0; i < maxItems; i++) {
    const nameMatch = nameMatches[i];
    const priceMatch = priceMatches[i];
    const descMatch = descMatches[i];
    
    // Try to match product ID by finding data-product-id near the price
    let productId: string | undefined = undefined;
    if (priceMatch && priceMatch.index !== undefined) {
      // Look for data-product-id in the same span or nearby
      const priceStart = priceMatch.index;
      const nearbyHtml = html.substring(Math.max(0, priceStart - 100), priceStart + 200);
      const idMatch = nearbyHtml.match(/data-product-id=["'](\d+)["']/i);
      if (idMatch) {
        productId = idMatch[1];
      }
    }
    
    if (!nameMatch || !priceMatch) continue;
    
    const name = nameMatch[1].trim();
    const priceStr = priceMatch[1].trim();
    const description = descMatch ? descMatch[1].trim() : undefined;
    const price = normalizePrice(priceStr);
    
    if (!name || price === 0) continue;
    
    const key = generateItemKey(name, productId);
    
    items.push({ key, name, price, description, productId });
  }
  
  return items;
}

/**
 * Fallback: Try to get menu from JSON endpoint if available
 * Currently not implemented, but structure is ready
 */
export async function fetchMenuFromApi(url: string): Promise<MenuItem[] | null> {
  try {
    // Try /api/menu endpoint if it exists
    const apiUrl = url.replace(/\/$/, '') + '/api/menu';
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.items)) {
        return data.items.map((item: any) => ({
          key: item.key || generateItemKey(item.name, item.id),
          name: item.name,
          price: typeof item.price === 'number' ? item.price : normalizePrice(item.price || '0'),
          description: item.description,
          productId: item.id?.toString(),
        }));
      }
    }
  } catch (error) {
    // Silently fail - we'll use HTML parsing
  }
  
  return null;
}
