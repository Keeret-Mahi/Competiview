/**
 * Monitoring storage utilities
 * Temporarily uses in-memory storage - will be replaced with Supabase later
 * Note: This is server-side only storage (resets on server restart)
 */

import type { WebsiteSnapshot, DetectedChange } from './change-detection';
import type { Competitor } from '@/app/onboarding/page';
import type { UpdateEvent } from './menu-diff';

// In-memory storage (server-side only)
const snapshotsStorage: WebsiteSnapshot[] = [];
const changesStorage: DetectedChange[] = [];
const updateEventsStorage: UpdateEvent[] = [];

/**
 * Clear all monitoring data (changes, snapshots, and update events)
 */
export function clearAllMonitoringData(): void {
  snapshotsStorage.length = 0;
  changesStorage.length = 0;
  updateEventsStorage.length = 0;
}

/**
 * Get all snapshots for a competitor
 */
export function getSnapshotsForCompetitor(competitorId: string): WebsiteSnapshot[] {
  try {
    return snapshotsStorage
      .filter(s => s.competitorId === competitorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting snapshots:', error);
    return [];
  }
}

/**
 * Save a snapshot
 */
export function saveSnapshot(snapshot: WebsiteSnapshot): void {
  try {
    snapshotsStorage.push(snapshot);
    
    // Keep only last 100 snapshots per competitor (to avoid memory bloat)
    const competitorSnapshots = snapshotsStorage.filter(s => s.competitorId === snapshot.competitorId);
    if (competitorSnapshots.length > 100) {
      competitorSnapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const toKeep = competitorSnapshots.slice(0, 100);
      const otherSnapshots = snapshotsStorage.filter(s => s.competitorId !== snapshot.competitorId);
      snapshotsStorage.length = 0;
      snapshotsStorage.push(...otherSnapshots, ...toKeep);
    }
  } catch (error) {
    console.error('Error saving snapshot:', error);
  }
}

/**
 * Get latest snapshot for a competitor
 */
export function getLatestSnapshot(competitorId: string, url: string): WebsiteSnapshot | null {
  const snapshots = getSnapshotsForCompetitor(competitorId);
  const matchingSnapshots = snapshots.filter(s => s.url === url);
  
  if (matchingSnapshots.length === 0) {
    return null;
  }
  
  // Sort by date (newest first) and return the most recent
  matchingSnapshots.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order (newest first)
  });
  
  return matchingSnapshots[0];
}

/**
 * Get all changes for a competitor
 */
export function getChangesForCompetitor(competitorId: string): DetectedChange[] {
  try {
    return changesStorage
      .filter(c => c.competitorId === competitorId)
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  } catch (error) {
    console.error('Error getting changes:', error);
    return [];
  }
}

/**
 * Save a detected change
 */
export function saveChange(change: DetectedChange): void {
  try {
    changesStorage.push(change);
    
    // Keep only last 200 changes total (to avoid memory bloat)
    if (changesStorage.length > 200) {
      changesStorage.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
      changesStorage.splice(200);
    }
  } catch (error) {
    console.error('Error saving change:', error);
  }
}

/**
 * Get competitor by ID (reads from process.env or returns null - will be replaced with Supabase)
 * For now, we'll need to pass competitor data through the API
 */
export function getCompetitorById(competitorId: string): Competitor | null {
  // This is a placeholder - in production, fetch from Supabase
  // For now, return null and let the API route handle it
  return null;
}

/**
 * Get competitor website URL
 */
export function getCompetitorUrl(competitorId: string): string | null {
  const competitor = getCompetitorById(competitorId);
  if (!competitor) return null;
  
  // If domain doesn't start with http, add https://
  const domain = competitor.domain;
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    return domain;
  }
  return `https://${domain}`;
}

/**
 * Save update events
 */
export function saveUpdateEvents(events: UpdateEvent[]): void {
  try {
    updateEventsStorage.push(...events);
    
    // Keep only last 500 events total (to avoid memory bloat)
    if (updateEventsStorage.length > 500) {
      updateEventsStorage.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      updateEventsStorage.splice(500);
    }
    
    console.log(`✅ Saved ${events.length} update events. Total events: ${updateEventsStorage.length}`);
  } catch (error) {
    console.error('Error saving update events:', error);
  }
}

/**
 * Get all update events for a competitor
 */
export function getUpdateEventsForCompetitor(competitorId: string): UpdateEvent[] {
  try {
    return updateEventsStorage
      .filter(e => e.competitorId === competitorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting update events:', error);
    return [];
  }
}

/**
 * Get all update events
 */
export function getAllUpdateEvents(): UpdateEvent[] {
  try {
    return [...updateEventsStorage].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting all update events:', error);
    return [];
  }
}

/**
 * Get latest snapshot with menu data for a competitor
 */
export function getLatestSnapshotWithMenu(competitorId: string, url: string): WebsiteSnapshot | null {
  const snapshot = getLatestSnapshot(competitorId, url);
  return snapshot && snapshot.menuItems ? snapshot : null;
}
