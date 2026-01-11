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
      console.log('🚀 Starting competitor discovery...');
      console.log('📋 Request data:', { 
        category, 
        city, 
        country, 
        postalCode, 
        companyName: companyInfo.name,
        cuisineType: companyInfo.cuisineType 
      });
      
      competitors = await discoverCompetitors(
        category,
        city,
        country,
        postalCode,
        companyInfo.name,
        companyInfo.cuisineType // Pass cuisine type to find competitors with same cuisine
      );
      
      console.log(`✅ Competitor discovery completed. Found ${competitors.length} competitors.`);
      
      if (competitors.length === 0) {
        console.warn('⚠️ No competitors found. This might be because:');
        console.warn('   - The business category doesn\'t match local businesses');
        console.warn('   - The location search returned no results');
        console.warn('   - All results were filtered out (no websites, or matched user company)');
      }
    } catch (error: any) {
      console.error('❌ Error discovering competitors:', error);
      console.error('Stack trace:', error.stack);
      
      // If Google Places API fails, return a helpful error
      if (error.message.includes('API key') || error.message.includes('not configured')) {
        return NextResponse.json(
          { 
            error: 'Google Places API key is not configured. Please add GOOGLE_PLACES_API_KEY to your .env.local file and RESTART your dev server.',
            details: error.message,
            debug: process.env.NODE_ENV === 'development' ? {
              envVarExists: !!process.env.GOOGLE_PLACES_API_KEY,
              envVarLength: process.env.GOOGLE_PLACES_API_KEY?.length || 0,
            } : undefined
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to discover competitors',
          details: error.message,
          competitors: [] // Return empty array on error so frontend can handle gracefully
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      companyInfo,
      competitors: competitors || [], // Ensure we always return an array
      location: {
        city,
        country,
        postalCode,
      },
      success: true,
      competitorsFound: competitors.length,
    });
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
