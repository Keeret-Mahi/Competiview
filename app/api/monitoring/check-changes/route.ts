import { NextRequest, NextResponse } from 'next/server';
import { createSnapshot, detectChange, computeSimilarity } from '@/lib/change-detection';
import { getLatestSnapshot, saveSnapshot, saveChange } from '@/lib/monitoring-storage';
import { classifyChange } from '@/lib/openai';

/**
 * POST /api/monitoring/check-changes
 * Checks for changes on a competitor website by comparing with latest snapshot
 */
export async function POST(request: NextRequest) {
  console.log('🚨 POST /api/monitoring/check-changes called');
  try {
    const body = await request.json();
    console.log('📦 Request body:', { competitorId: body.competitorId, url: body.url });
    const { competitorId, url } = body;

    if (!competitorId || !url) {
      console.error('❌ Missing required fields:', { competitorId, url });
      return NextResponse.json(
        { error: 'competitorId and url are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking for changes: competitor ${competitorId} at ${url}`);

    // Get latest snapshot
    const oldSnapshot = getLatestSnapshot(competitorId, url);
    console.log(`📸 Old snapshot:`, oldSnapshot ? `Found (id: ${oldSnapshot.id}, hash: ${oldSnapshot.contentHash.substring(0, 8)}...)` : 'None (first snapshot)');

    // Create new snapshot
    console.log(`📸 Creating new snapshot from ${url}...`);
    const newSnapshot = await createSnapshot(competitorId, url);
    console.log(`✅ New snapshot created (id: ${newSnapshot.id}, hash: ${newSnapshot.contentHash.substring(0, 8)}..., text length: ${newSnapshot.normalizedText.length})`);
    saveSnapshot(newSnapshot);

    // If no old snapshot, this is the first snapshot - no change to detect
    if (!oldSnapshot) {
      console.log('📸 First snapshot created - no changes to detect');
      return NextResponse.json({
        change: null,
        snapshot: newSnapshot,
        message: 'First snapshot created',
      });
    }

    // Detect changes
    console.log(`🔍 Calling detectChange...`);
    const detectedChange = detectChange(oldSnapshot, newSnapshot);
    console.log(`🔍 detectChange result:`, detectedChange ? `Change detected (type: ${detectedChange.changeType})` : 'No change detected');

    if (!detectedChange) {
      // Log similarity for debugging
      const similarity = computeSimilarity(
        oldSnapshot.normalizedText,
        newSnapshot.normalizedText
      );
      console.log(`✅ No significant changes detected (similarity: ${(similarity * 100).toFixed(1)}%, threshold: 95%)`);
      return NextResponse.json({
        change: null,
        snapshot: newSnapshot,
        message: 'No changes detected',
        similarity: similarity,
      });
    }

    // Enhance with OpenAI classification
    try {
      const classification = await classifyChange(
        detectedChange.beforeExcerpt,
        detectedChange.afterExcerpt,
        url
      );

      detectedChange.changeType = classification.changeType;
      detectedChange.severity = classification.severity;
      detectedChange.rationale = classification.rationale;
      detectedChange.recommendedActions = classification.recommendedActions;
    } catch (error) {
      console.warn('OpenAI classification failed, using default classification:', error);
      // Continue with default classification
    }

    // Save change
    saveChange(detectedChange);

    console.log(`🚨 Change detected: ${detectedChange.changeType} (${detectedChange.severity} severity)`);

    return NextResponse.json({
      change: detectedChange,
      snapshot: newSnapshot,
      message: 'Change detected',
    });
  } catch (error: any) {
    console.error('Error checking for changes:', error);
    return NextResponse.json(
      { error: 'Failed to check for changes', details: error.message },
      { status: 500 }
    );
  }
}
