# Competitor Discovery Implementation

This document explains how competitor discovery works in Competiview.

## Overview

The competitor discovery system uses:
1. **Website Scraping** - Extracts company information from the user's website URL
2. **Google Places API** - Finds local competitors based on business category and location

## Architecture

### 1. Frontend Flow

**Step 1 (Business Info)** → User fills in:
- Company Website URL (required)
- Business Category (required)
- Location: Country, City, Postal Code (required)
- Instagram URL (optional)
- LinkedIn URL (optional)

**Step 2 (Competitor Discovery)** → When user clicks "Continue":
- Automatically calls `/api/onboarding/discover-competitors`
- Shows loading state
- Displays discovered competitors
- Falls back to mock data if API fails

### 2. Backend API Route

**`/app/api/onboarding/discover-competitors/route.ts`**

Endpoint: `POST /api/onboarding/discover-competitors`

**Request Body:**
```json
{
  "websiteUrl": "https://example.com",
  "category": "restaurant",
  "city": "San Francisco",
  "country": "United States",
  "postalCode": "94102"
}
```

**Response:**
```json
{
  "companyInfo": {
    "name": "Example Company",
    "description": "Company description",
    "keywords": ["keyword1", "keyword2"]
  },
  "competitors": [
    {
      "id": "comp-1",
      "name": "Competitor Name",
      "domain": "competitor.com",
      "initial": "C",
      "color": "indigo",
      "matchScore": 95,
      "selected": true
    }
  ],
  "location": {
    "city": "San Francisco",
    "country": "United States",
    "postalCode": "94102"
  }
}
```

### 3. Utility Functions

#### `lib/scraper.ts` - Website Scraping
- `extractCompanyInfo(websiteUrl)` - Extracts basic company info from website HTML
- Uses simple regex parsing (can be enhanced with Cheerio or Readability.js)

#### `lib/competitor-discovery.ts` - Google Places Integration
- `discoverCompetitors(category, city, country, postalCode, companyName)` - Main discovery function
- Maps business categories to Google Places types
- Uses Google Places Text Search API to find businesses
- Filters results to only include businesses with websites
- Calculates match scores based on ratings and relevance
- Returns up to 10 competitors

## Google Places API Setup

### Required API Key
Add to `.env.local`:
```bash
GOOGLE_PLACES_API_KEY=your_api_key_here
```

### How It Works
1. **Text Search** - Searches for businesses matching category + location
2. **Place Type Filtering** - Filters by relevant business types
3. **Website Extraction** - Extracts website URLs from place details
4. **Domain Normalization** - Converts website URLs to domains

### Category Mapping

The system maps your business categories to Google Places types:

| Category | Google Places Type |
|----------|-------------------|
| restaurant | restaurant |
| retail | store |
| saas | establishment |
| ecommerce | store |
| finance | finance |
| healthcare | health |
| fitness | gym |
| ... | ... |

See `lib/competitor-discovery.ts` for full mapping.

## Error Handling

The system has multiple fallback layers:

1. **API Key Missing** → Returns clear error message
2. **API Request Fails** → Falls back to mock data
3. **No Competitors Found** → Falls back to mock data
4. **Website Scraping Fails** → Continues with competitor discovery using provided data

Users can always manually add competitors if automated discovery fails.

## Rate Limiting Considerations

- Google Places API has usage limits and costs
- Consider implementing:
  - Request caching (cache results for 24 hours)
  - Rate limiting per user
  - Usage monitoring
  - Fallback strategies for high-traffic scenarios

## Future Enhancements

1. **Better Website Scraping**:
   - Use Cheerio or Puppeteer for better HTML parsing
   - Extract structured data (schema.org)
   - Extract social media links

2. **Alternative Discovery Sources**:
   - LinkedIn API for company discovery
   - Instagram API for local businesses
   - Industry-specific directories
   - Local business listings (Yelp, Foursquare)

3. **Enhanced Matching**:
   - Use company description/keywords for better matching
   - ML-based similarity scoring
   - Industry-specific matching algorithms

4. **Caching & Performance**:
   - Cache competitor discovery results
   - Batch API requests
   - Implement incremental discovery

## Testing

To test without a Google Places API key:
1. The API will return an error
2. The frontend will automatically fall back to mock data
3. Users can still complete onboarding and manually add competitors

To test with API key:
1. Add `GOOGLE_PLACES_API_KEY` to `.env.local`
2. Restart your Next.js dev server
3. Fill out the onboarding form with real data
4. Check browser console for API responses
