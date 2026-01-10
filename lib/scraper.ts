/**
 * Web scraping utilities for extracting company information from websites
 */

export interface CompanyInfo {
  name: string;
  description: string;
  keywords: string[];
  industry?: string;
  location?: string;
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

    return {
      name,
      description,
      keywords,
    };
  } catch (error) {
    console.error('Error extracting company info:', error);
    // Return fallback data
    const url = new URL(websiteUrl);
    return {
      name: url.hostname.replace('www.', ''),
      description: '',
      keywords: [],
    };
  }
}
