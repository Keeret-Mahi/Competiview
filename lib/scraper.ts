/**
 * Web scraping utilities for extracting company information from websites
 */

export interface CompanyInfo {
  name: string;
  description: string;
  keywords: string[];
  industry?: string;
  location?: string;
  cuisineType?: string; // For restaurants: pizza, italian, chinese, etc.
}

/**
 * Extract main content from HTML (simplified - removes scripts, styles, nav, footer)
 * Returns title and main text content
 */
export async function extractMainContent(html: string, url: string): Promise<{ title: string; text: string }> {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Remove scripts, styles, and other non-content elements
  let cleanedHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');

  // Extract text content from common content elements
  const contentMatches = cleanedHtml.match(/<(main|article|section|div)[^>]*>[\s\S]*?<\/(main|article|section|div)>/gi);
  
  let text = '';
  if (contentMatches) {
    text = contentMatches
      .join(' ')
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  } else {
    // Fallback: extract all text
    text = cleanedHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return { title, text };
}

/**
 * Extract basic company information from a website URL
 * This is a simple implementation - in production, you might want to use
 * more sophisticated extraction tools like Readability.js or Cheerio
 */
export async function extractCompanyInfo(websiteUrl: string): Promise<CompanyInfo> {
  try {
    // Fetch the website HTML
    const response = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract basic information using regex (simple approach)
    // In production, consider using a proper HTML parser like Cheerio
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const name = titleMatch ? titleMatch[1].split('|')[0].split('-')[0].trim() : 'Unknown Company';

    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = metaDescMatch ? metaDescMatch[1] : '';

    // Extract keywords from meta tags or h1/h2 tags
    const keywords: string[] = [];
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
    if (h1Matches) {
      h1Matches.slice(0, 3).forEach(match => {
        const text = match.replace(/<[^>]+>/g, '').trim();
        if (text) keywords.push(text);
      });
    }

    // Extract cuisine type for restaurants
    // Look for common cuisine keywords in title, description, and body text
    const cuisineType = extractCuisineType(name, description, html);

    return {
      name,
      description,
      keywords,
      cuisineType,
    };
  } catch (error) {
    console.error('Error extracting company info:', error);
    // Return fallback data
    const url = new URL(websiteUrl);
    return {
      name: url.hostname.replace('www.', ''),
      description: '',
      keywords: [],
      cuisineType: undefined,
    };
  }
}

/**
 * Extract cuisine type from website content
 * Looks for common cuisine keywords in title, description, and body text
 */
function extractCuisineType(title: string, description: string, html: string): string | undefined {
  // Common cuisine types and their keywords
  const cuisineKeywords: Record<string, string[]> = {
    pizza: ['pizza', 'pizzeria', 'pizza place', 'italian pizza'],
    italian: ['italian', 'italy', 'pasta', 'risotto', 'gelato'],
    chinese: ['chinese', 'china', 'szechuan', 'cantonese', 'dim sum', 'wonton'],
    japanese: ['japanese', 'japan', 'sushi', 'ramen', 'tempura', 'teriyaki'],
    mexican: ['mexican', 'mexico', 'taco', 'burrito', 'enchilada', 'quesadilla'],
    indian: ['indian', 'india', 'curry', 'tandoori', 'naan', 'biryani'],
    thai: ['thai', 'thailand', 'pad thai', 'tom yum', 'green curry'],
    mediterranean: ['mediterranean', 'greek', 'gyro', 'hummus', 'falafel'],
    american: ['american', 'burger', 'bbq', 'barbecue', 'steakhouse'],
    french: ['french', 'france', 'bistro', 'brasserie', 'croissant'],
    seafood: ['seafood', 'fish', 'lobster', 'crab', 'oyster'],
    vegetarian: ['vegetarian', 'vegan', 'plant-based'],
  };

  // Combine all text to search
  const searchText = `${title} ${description} ${html}`.toLowerCase();

  // Find matching cuisine types
  const matches: { cuisine: string; score: number }[] = [];

  for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      // Count occurrences of keyword
      const regex = new RegExp(keyword, 'gi');
      const matches = searchText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > 0) {
      matches.push({ cuisine, score });
    }
  }

  // Return the cuisine with the highest score
  if (matches.length > 0) {
    matches.sort((a, b) => b.score - a.score);
    const topCuisine = matches[0].cuisine;
    console.log(`🍽️ Detected cuisine type: ${topCuisine} (score: ${matches[0].score})`);
    return topCuisine;
  }

  return undefined;
}
