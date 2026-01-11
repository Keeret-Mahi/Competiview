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
 * @param cuisineType - Cuisine type extracted from website (e.g., "pizza", "italian")
 */
export async function discoverCompetitors(
  businessCategory: string,
  city: string,
  country: string,
  postalCode?: string,
  companyName?: string,
  cuisineType?: string
): Promise<Competitor[]> {
  // Get API key - Next.js loads .env.local automatically, but server must be restarted
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ GOOGLE_PLACES_API_KEY is not configured or empty');
    console.error('Available env vars with GOOGLE/PLACES:', Object.keys(process.env).filter(key => 
      key.toUpperCase().includes('GOOGLE') || key.toUpperCase().includes('PLACES')
    ));
    throw new Error(
      'Google Places API key is not configured. ' +
      'Please ensure GOOGLE_PLACES_API_KEY is in your .env.local file and RESTART your dev server (stop and run npm run dev again).'
    );
  }

  console.log('✅ GOOGLE_PLACES_API_KEY is loaded (length:', apiKey.length, 'chars)');

  // Build location query
  const locationQuery = postalCode 
    ? `${postalCode}, ${city}, ${country}`
    : `${city}, ${country}`;

  // Get place type for the category
  const placeType = categoryToPlaceType[businessCategory] || 'establishment';

  try {
    // Step 1: Use Text Search to find businesses in the area
    // If cuisine type is detected, use it to find competitors with the same cuisine
    // Otherwise, just search by business category
    let searchQuery: string;
    
    if (cuisineType && businessCategory === 'restaurant') {
      // For restaurants, search by cuisine type to find competitors with the same food
      searchQuery = `${cuisineType} restaurant in ${locationQuery}`;
      console.log('🍽️ Using cuisine-specific search:', searchQuery);
    } else {
      // For other categories, use the general category
      searchQuery = `${businessCategory} in ${locationQuery}`;
    }
    
    console.log('🔍 Searching Google Places API with query:', searchQuery);
    console.log('🔍 Place type:', placeType);
    console.log('🔍 Location query:', locationQuery);
    if (cuisineType) {
      console.log('🍽️ Cuisine type:', cuisineType);
    }
    
    const textSearchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    textSearchUrl.searchParams.set('query', searchQuery);
    textSearchUrl.searchParams.set('key', apiKey);
    // Note: 'type' parameter is deprecated in Places API (New), but still works for Text Search

    console.log('🔍 API URL:', textSearchUrl.toString().replace(apiKey, 'API_KEY_HIDDEN'));

    const searchResponse = await fetch(textSearchUrl.toString());
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ Google Places API HTTP error:', searchResponse.status, errorText);
      throw new Error(`Google Places API HTTP error: ${searchResponse.status} ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();

    console.log('🔍 Google Places API response status:', searchData.status);
    console.log('🔍 Number of results:', searchData.results?.length || 0);
    
    if (searchData.status === 'ZERO_RESULTS') {
      console.warn('⚠️ No results found for:', searchQuery);
      return [];
    }
    
    if (searchData.status !== 'OK') {
      console.error('❌ Google Places API error status:', searchData.status);
      console.error('❌ Error message:', searchData.error_message || 'No error message');
      throw new Error(`Google Places API returned status: ${searchData.status}. ${searchData.error_message || ''}`);
    }

    const places: any[] = searchData.results || [];
    console.log('✅ Found', places.length, 'places');

    // Filter and transform results
    // Note: Text Search API doesn't return website in initial response
    // We'll include all results and try to extract domain from place name if no website
    const filteredPlaces = places.filter((place) => {
      // Exclude the user's own company if name is provided
      if (companyName && place.name?.toLowerCase().includes(companyName.toLowerCase())) {
        console.log('🚫 Excluding user company:', place.name);
        return false;
      }
      // Include all places for now (we'll handle website extraction separately)
      return true;
    }).slice(0, 7); // Limit to 7 competitors (as requested: 5-7)

    console.log('✅ Filtered to', filteredPlaces.length, 'competitors after excluding user company');

    const competitors: Competitor[] = filteredPlaces.map((place, index) => {
        // Extract domain - try website first, then business_status, then generate from name
        let domain = place.name?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || `competitor-${index}`;
        
        // Text Search might have website, but it's rare - we'd need Place Details API
        if (place.website) {
          try {
            const url = new URL(place.website);
            domain = url.hostname.replace('www.', '');
          } catch {
            // If URL parsing fails, use the name-based domain
          }
        } else {
          // If no website, create a plausible domain from the business name
          domain = `${domain}.com`;
        }
        
        console.log(`📍 Competitor ${index + 1}: ${place.name} - Domain: ${domain}`);

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
