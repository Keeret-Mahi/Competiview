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
    let competitors: any[] = [];
    
    // Always include the pizza demo competitor for demo purposes
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const pizzaDemoCompetitor = {
      id: 'pizza-demo',
      name: 'Slice & Wood Pizzeria',
      domain: `${baseUrl}/api/demo/pizza-website`,
      initial: 'S',
      color: 'red',
      matchScore: 100,
      selected: true,
    };
    
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
      
      const discoveredCompetitors = await discoverCompetitors(
        category,
        city,
        country,
        postalCode,
        companyInfo.name,
        companyInfo.cuisineType // Pass cuisine type to find competitors with same cuisine
      );
      
      competitors = discoveredCompetitors || [];
      
      console.log(`✅ Competitor discovery completed. Found ${competitors.length} competitors.`);
      
      // Check if pizza demo is already in the list (avoid duplicates)
      const hasPizzaDemo = competitors.some((c: any) => c.id === 'pizza-demo');
      if (!hasPizzaDemo) {
        competitors.unshift(pizzaDemoCompetitor); // Add to the beginning
        console.log('✅ Added Slice & Wood Pizzeria to competitor list');
      }
      
      if (competitors.length === 0) {
        console.warn('⚠️ No competitors found. This might be because:');
        console.warn('   - The business category doesn\'t match local businesses');
        console.warn('   - The location search returned no results');
        console.warn('   - All results were filtered out (no websites, or matched user company)');
        // Even if no competitors found, include the pizza demo
        competitors = [pizzaDemoCompetitor];
      }
    } catch (error: any) {
      console.error('❌ Error discovering competitors:', error);
      console.error('Stack trace:', error.stack);
      
      // Even on error, include the pizza demo competitor
      competitors = [pizzaDemoCompetitor];
      console.log('✅ Added Slice & Wood Pizzeria as fallback competitor');
      
      // If Google Places API fails, still return competitors (with pizza demo) but log the error
      if (error.message.includes('API key') || error.message.includes('not configured')) {
        // Don't return error - just log it and return pizza demo
        console.warn('⚠️ Google Places API key not configured, using demo competitor only');
      }
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
