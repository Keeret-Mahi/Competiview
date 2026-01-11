import { NextRequest, NextResponse } from 'next/server';
import { getAllUpdateEvents, getUpdateEventsForCompetitor } from '@/lib/monitoring-storage';

/**
 * GET /api/monitoring/updates
 * Get all update events, optionally filtered by competitor
 * 
 * Query params: competitorId (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const competitorId = searchParams.get('competitorId');
    
    let events;
    if (competitorId) {
      events = getUpdateEventsForCompetitor(competitorId);
    } else {
      events = getAllUpdateEvents();
    }
    
    // Separate by type
    const productUpdates = events.filter(e => e.type === 'PRODUCT_ADDED');
    const priceUpdates = events.filter(e => e.type === 'PRICE_CHANGED');
    
    return NextResponse.json({
      events,
      productUpdates,
      priceUpdates,
      total: events.length,
    });
  } catch (error: any) {
    console.error('Error fetching updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch updates', details: error.message },
      { status: 500 }
    );
  }
}
