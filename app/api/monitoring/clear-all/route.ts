import { NextRequest, NextResponse } from 'next/server';
import { clearAllMonitoringData } from '@/lib/monitoring-storage';

/**
 * POST /api/monitoring/clear-all
 * Clears all monitoring data (changes and snapshots) from in-memory storage
 * 
 * WARNING: This will delete all changes and snapshots for all competitors
 */
export async function POST(request: NextRequest) {
  try {
    clearAllMonitoringData();
    
    console.log('🗑️ All monitoring data cleared');
    
    return NextResponse.json({
      success: true,
      message: 'All monitoring data cleared successfully',
    });
  } catch (error: any) {
    console.error('Error clearing monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to clear monitoring data', details: error.message },
      { status: 500 }
    );
  }
}
