import { NextRequest, NextResponse } from 'next/server';
import { extractCompanyInfo } from '@/lib/scraper';
import { discoverCompetitors } from '@/lib/competitor-discovery';

/**
 * POST /api/onboarding/discover-competitors
 * 
 * Discovers competitors based on:
 * - Company website URL (to extract company name and info)
 * - Business category
 * - Location (city, country, postal code)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websiteUrl, category, city, country, postalCode } = body;

    // Validate required fields
    if (!websiteUrl || !category || !city || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: websiteUrl, category, city, and country are required' },
        { status: 400 }
      );
    }

    // Step 1: Extract company information from website
    let companyInfo;
    try {
      companyInfo = await extractCompanyInfo(websiteUrl);
    } catch (error: any) {
      console.error('Error extracting company info:', error);
      // Continue with competitor discovery even if extraction fails
      companyInfo = { name: '', description: '', keywords: [] };
    }

    // Step 2: Discover competitors using Google Places API
    let competitors;
    try {
      competitors = await discoverCompetitors(
        category,
        city,
        country,
        postalCode,
        companyInfo.name
      );
    } catch (error: any) {
      console.error('Error discovering competitors:', error);
      
      // If Google Places API fails, return a helpful error
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { 
            error: 'Google Places API key is not configured. Please add GOOGLE_PLACES_API_KEY to your .env.local file.',
            details: error.message
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to discover competitors',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      companyInfo,
      competitors,
      location: {
        city,
        country,
        postalCode,
      },
    });
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
