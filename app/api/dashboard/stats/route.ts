import { NextResponse } from 'next/server';
import { getAllUpdateEvents } from '@/lib/monitoring-storage';

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
export async function GET() {
  try {
    // Get all update events
    const allEvents = getAllUpdateEvents();
    
    // Get all changes (from the older change detection system)
    // For now, we'll count update events as the primary source
    const totalThreats = allEvents.length;
    
    // High severity: count pricing changes (they're typically more urgent)
    // Product additions are also high severity
    const highSeverity = allEvents.filter(e => 
      e.type === 'PRICE_CHANGED' || e.type === 'PRODUCT_ADDED'
    ).length;
    
    // Get unique competitor IDs
    const uniqueCompetitors = new Set(allEvents.map(e => e.competitorId));
    const monitoredOrgs = uniqueCompetitors.size || 1; // Default to 1 if none (at least the demo)
    
    // Recent changes (last 24 hours)
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentChanges = allEvents.filter(e => 
      new Date(e.createdAt).getTime() > last24Hours.getTime()
    ).length;
    
    // Calculate trends (compare last 24h to previous 24h)
    const previous24Hours = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const previousChanges = allEvents.filter(e => {
      const eventTime = new Date(e.createdAt).getTime();
      return eventTime > previous24Hours.getTime() && eventTime <= last24Hours.getTime();
    }).length;
    
    const totalThreatsTrend = previousChanges > 0 
      ? ((recentChanges - previousChanges) / previousChanges * 100).toFixed(0)
      : recentChanges > 0 ? '100' : '0';
    
    const highSeverityTrend = '0%'; // Can be enhanced later
    
    return NextResponse.json({
      totalThreats,
      highSeverity,
      monitoredOrgs,
      recentChanges,
      trends: {
        totalThreats: `${totalThreatsTrend}%`,
        highSeverity: highSeverityTrend,
        monitoredOrgs: '0%',
        recentChanges: `${totalThreatsTrend}%`,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}
