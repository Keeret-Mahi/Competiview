# Environment Variables Setup

This document explains how to set up the required environment variables for Competiview.

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

### Google Places API Key

```bash
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## How to Get a Google Places API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select an existing one)
3. **Enable the Places API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"

4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

5. **Restrict your API Key** (Recommended for production):
   - Click on your newly created API key
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API" (and "Places API (New)" if available)
   - Under "Application restrictions", you can restrict by HTTP referrers, IP addresses, or Android/iOS apps

6. **Add the key to your `.env.local` file**:
   ```bash
   GOOGLE_PLACES_API_KEY=AIzaSyC...your_key_here
   ```

## API Usage Notes

- The Google Places API has usage limits and pricing based on requests
- Text Search requests cost $32 per 1000 requests
- Place Details requests cost $17 per 1000 requests
- There's a $200 free credit per month for new Google Cloud accounts
- Monitor your usage in the Google Cloud Console

## Rate Limiting

The current implementation makes API calls server-side to:
- Keep API keys secure
- Avoid CORS issues
- Implement rate limiting on the server

## Testing Without API Key

If you don't have a Google Places API key yet, the application will:
1. Attempt to call the API
2. Fall back to mock data if the API call fails
3. Display an error message to the user

You can test the UI flow with mock data, but for real competitor discovery, you'll need a valid API key.
