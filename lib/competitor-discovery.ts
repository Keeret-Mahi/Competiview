/**
 * Competitor discovery using Google Places API
 */

export interface CompetitorResult {
  id: string;
  name: string;
  website?: string;
  domain: string;
  address?: string;
  rating?: number;
  types?: string[];
}

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  initial: string;
  color: string;
  matchScore: number;
  selected: boolean;
}

/**
 * Map business categories to Google Places types
 */
const categoryToPlaceType: Record<string, string> = {
  restaurant: 'restaurant',
  retail: 'store',
  saas: 'establishment', // Google Places doesn't have a specific type for SaaS
  ecommerce: 'store',
  finance: 'finance',
  healthcare: 'health',
  fitness: 'gym',
  education: 'school',
  'real-estate': 'real_estate_agency',
  legal: 'lawyer',
  consulting: 'establishment',
  marketing: 'establishment',
  beauty: 'beauty_salon',
  automotive: 'car_dealer',
  construction: 'general_contractor',
  hospitality: 'lodging',
  manufacturing: 'establishment',
  logistics: 'establishment',
  energy: 'establishment',
  telecom: 'establishment',
  agriculture: 'establishment',
  nonprofit: 'establishment',
  other: 'establishment',
};

/**
 * Discover competitors using Google Places API
 * 
 * @param businessCategory - Category from onboarding form
 * @param city - City name
 * @param country - Country name
 * @param postalCode - Postal/ZIP code (optional)
 * @param companyName - The user's company name (to exclude from results)
 */
export async function discoverCompetitors(
  businessCategory: string,
  city: string,
  country: string,
  postalCode?: string,
  companyName?: string
): Promise<Competitor[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY is not configured');
    // Return empty array or throw error
    throw new Error('Google Places API key is not configured. Please add GOOGLE_PLACES_API_KEY to your .env.local file.');
  }

  // Build location query
  const locationQuery = postalCode 
    ? `${postalCode}, ${city}, ${country}`
    : `${city}, ${country}`;

  // Get place type for the category
  const placeType = categoryToPlaceType[businessCategory] || 'establishment';

  try {
    // Step 1: Use Text Search to find businesses in the area
    // This is better than Nearby Search for finding competitors by category and location
    const searchQuery = `${businessCategory} in ${locationQuery}`;
    
    const textSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    textSearchUrl.searchParams.set('query', searchQuery);
    textSearchUrl.searchParams.set('type', placeType);
    textSearchUrl.searchParams.set('key', apiKey);

    const searchResponse = await fetch(textSearchUrl.toString());
    
    if (!searchResponse.ok) {
      throw new Error(`Google Places API error: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API returned status: ${searchData.status}`);
    }

    const places: any[] = searchData.results || [];

    // Filter and transform results
    const competitors: Competitor[] = places
      .filter((place) => {
        // Exclude the user's own company if name is provided
        if (companyName && place.name?.toLowerCase().includes(companyName.toLowerCase())) {
          return false;
        }
        // Only include places with a website
        return place.website || (place.url && place.url.includes('maps'));
      })
      .slice(0, 10) // Limit to 10 competitors
      .map((place, index) => {
        // Extract domain from website URL
        let domain = place.name?.toLowerCase().replace(/\s+/g, '') || `competitor-${index}`;
        if (place.website) {
          try {
            const url = new URL(place.website);
            domain = url.hostname.replace('www.', '');
          } catch {
            // If URL parsing fails, use the name-based domain
          }
        }

        // Calculate match score (simplified - based on rating and relevance)
        const matchScore = Math.min(
          100,
          Math.max(
            75,
            75 + (place.rating ? Math.round(place.rating * 4) : 0) + (index < 3 ? 15 : 0)
          )
        );

        // Color assignment for badges
        const colors = ['indigo', 'orange', 'green', 'purple', 'pink', 'blue', 'teal', 'yellow'];
        const color = colors[index % colors.length];

        return {
          id: `comp-${place.place_id || index}`,
          name: place.name || `Competitor ${index + 1}`,
          domain,
          initial: (place.name?.[0]?.toUpperCase() || 'C'),
          color,
          matchScore,
          selected: index < 3, // First 3 selected by default
        };
      });

    return competitors;
  } catch (error) {
    console.error('Error discovering competitors:', error);
    // Return empty array on error - the UI should handle this gracefully
    return [];
  }
}

/**
 * Get place details (website, phone, etc.) using place_id
 * This is useful if the initial search doesn't return all needed info
 */
export async function getPlaceDetails(placeId: string): Promise<any> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('Google Places API key is not configured');
  }

  const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  detailsUrl.searchParams.set('place_id', placeId);
  detailsUrl.searchParams.set('fields', 'name,website,formatted_phone_number,formatted_address');
  detailsUrl.searchParams.set('key', apiKey);

  const response = await fetch(detailsUrl.toString());
  const data = await response.json();

  if (data.status === 'OK' && data.result) {
    return data.result;
  }

  return null;
}
