import { NextRequest, NextResponse } from 'next/server';
import { createSnapshot } from '@/lib/change-detection';
import { 
  getLatestSnapshotWithMenu, 
  saveSnapshot, 
  saveUpdateEvents 
} from '@/lib/monitoring-storage';
import { diffMenus } from '@/lib/menu-diff';
import type { Competitor } from '@/app/onboarding/page';

/**
 * POST /api/monitoring/menu/check-now
 * Manually trigger a menu check for all competitors or a specific one
 * 
 * Body: { competitorId?: string }
 * If competitorId is provided, only check that competitor
 * Otherwise check all competitors from localStorage
 */
export async function POST(request: NextRequest) {
  console.log('🚨 POST /api/monitoring/menu/check-now called');
  
  try {
    const body = await request.json().catch(() => ({}));
    const { competitorId: specificCompetitorId } = body;
    
    // Get competitors from localStorage via request body (client sends it)
    // OR from a default pizza competitor
    let competitors: Competitor[] = [];
    
    if (body.competitors && Array.isArray(body.competitors)) {
      competitors = body.competitors;
    } else {
      // Default: use pizza website competitor
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      competitors = [{
        id: 'pizza-demo',
        name: 'Slice & Wood Pizzeria',
        domain: `${baseUrl}/api/demo/pizza-website`,
        initial: 'S',
        color: 'red',
        matchScore: 100,
        selected: true,
      }];
    }
    
    // Filter to specific competitor if requested
    if (specificCompetitorId) {
      competitors = competitors.filter(c => c.id === specificCompetitorId);
    }
    
    if (competitors.length === 0) {
      return NextResponse.json(
        { error: 'No competitors found to check' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Checking ${competitors.length} competitor(s)...`);
    
    const results = [];
    let totalEvents = 0;
    
    for (const competitor of competitors) {
      try {
        const url = competitor.domain.startsWith('http://') || competitor.domain.startsWith('https://')
          ? competitor.domain
          : `https://${competitor.domain}`;
        
        console.log(`📸 Checking competitor: ${competitor.name} (${url})`);
        
        // Get latest snapshot with menu data
        const oldSnapshot = getLatestSnapshotWithMenu(competitor.id, url);
        
        // Create new snapshot
        const newSnapshot = await createSnapshot(competitor.id, url);
        
        // Save new snapshot
        saveSnapshot(newSnapshot);
        
        console.log(`✅ New snapshot created for ${competitor.name}`);
        
        // If no old snapshot or no menu items, this is the first check
        if (!oldSnapshot || !oldSnapshot.menuItems || !newSnapshot.menuItems) {
          console.log(`📸 First snapshot for ${competitor.name} - no changes to detect`);
          results.push({
            competitorId: competitor.id,
            competitorName: competitor.name,
            events: [],
            message: 'First snapshot created',
          });
          continue;
        }
        
        // Diff menus and generate events
        const events = diffMenus(
          oldSnapshot.menuItems,
          newSnapshot.menuItems,
          competitor.id,
          competitor.name,
          url
        );
        
        // Save events
        if (events.length > 0) {
          saveUpdateEvents(events);
          totalEvents += events.length;
        }
        
        results.push({
          competitorId: competitor.id,
          competitorName: competitor.name,
          events: events.map(e => ({
            id: e.id,
            type: e.type,
            itemName: e.payload.itemName,
            oldPrice: e.payload.oldPrice,
            newPrice: e.payload.newPrice,
            price: e.payload.price,
            createdAt: e.createdAt,
          })),
          message: events.length > 0 
            ? `Found ${events.length} update(s)` 
            : 'No changes detected',
        });
        
        console.log(`✅ Checked ${competitor.name}: ${events.length} events`);
      } catch (error: any) {
        console.error(`❌ Error checking ${competitor.name}:`, error);
        results.push({
          competitorId: competitor.id,
          competitorName: competitor.name,
          error: error.message,
        });
      }
    }
    
    console.log(`✅ Check complete: ${totalEvents} total events across ${competitors.length} competitor(s)`);
    
    return NextResponse.json({
      success: true,
      checkedAt: new Date().toISOString(),
      totalEvents,
      results,
    });
  } catch (error: any) {
    console.error('❌ Error in check-now:', error);
    return NextResponse.json(
      { error: 'Failed to check for updates', details: error.message },
      { status: 500 }
    );
  }
}
