import { NextRequest, NextResponse } from 'next/server';
import { createSnapshot } from '@/lib/change-detection';
import { saveSnapshot, getLatestSnapshot } from '@/lib/monitoring-storage';

/**
 * POST /api/monitoring/snapshot
 * Creates a new snapshot of a competitor website
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorId, url } = body;

    if (!competitorId || !url) {
      return NextResponse.json(
        { error: 'competitorId and url are required' },
        { status: 400 }
      );
    }

    console.log(`📸 Creating snapshot for competitor ${competitorId} at ${url}`);

    // Create snapshot
    const snapshot = await createSnapshot(competitorId, url);

    // Save snapshot
    saveSnapshot(snapshot);

    console.log(`✅ Snapshot created: ${snapshot.id}`);

    return NextResponse.json({
      snapshot,
      message: 'Snapshot created successfully',
    });
  } catch (error: any) {
    console.error('Error creating snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create snapshot', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/monitoring/snapshot?competitorId=xxx&url=xxx
 * Gets the latest snapshot for a competitor
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const competitorId = searchParams.get('competitorId');
    const url = searchParams.get('url');

    if (!competitorId || !url) {
      return NextResponse.json(
        { error: 'competitorId and url are required' },
        { status: 400 }
      );
    }

    const snapshot = getLatestSnapshot(competitorId, url);

    if (!snapshot) {
      return NextResponse.json(
        { snapshot: null, message: 'No snapshot found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ snapshot });
  } catch (error: any) {
    console.error('Error getting snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to get snapshot', details: error.message },
      { status: 500 }
    );
  }
}
