import { NextRequest, NextResponse } from 'next/server';
import { getChangesForCompetitor, getSnapshotsForCompetitor } from '@/lib/monitoring-storage';
import type { Competitor } from '@/app/onboarding/page';

/**
 * GET /api/monitoring/competitor/[id]
 * Gets all monitoring data for a competitor
 * Note: Competitor data should be passed from client (localStorage)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both sync and async params (Next.js 15+ uses async params)
    const resolvedParams = 'then' in params ? await params : params;
    const competitorId = resolvedParams.id;

    if (!competitorId) {
      return NextResponse.json(
        { error: 'competitorId is required' },
        { status: 400 }
      );
    }

    // Get all changes
    const changes = getChangesForCompetitor(competitorId);

    // Get snapshots
    const snapshots = getSnapshotsForCompetitor(competitorId);

    // Group changes by type
    const productChanges = changes.filter(c => c.changeType === 'product');
    const pricingChanges = changes.filter(c => c.changeType === 'pricing');
    const otherChanges = changes.filter(c => c.changeType === 'other');

    return NextResponse.json({
      changes: {
        all: changes,
        product: productChanges,
        pricing: pricingChanges,
        other: otherChanges,
      },
      snapshots: snapshots.slice(0, 10), // Return last 10 snapshots
      stats: {
        totalChanges: changes.length,
        productChanges: productChanges.length,
        pricingChanges: pricingChanges.length,
        otherChanges: otherChanges.length,
        lastSnapshot: snapshots[0] || null,
      },
    });
  } catch (error: any) {
    console.error('Error getting competitor monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to get monitoring data', details: error.message },
      { status: 500 }
    );
  }
}
