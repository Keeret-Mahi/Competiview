import { NextRequest, NextResponse } from 'next/server';
import { createSnapshot, detectChange } from '@/lib/change-detection';
import { getLatestSnapshot, saveSnapshot, saveChange } from '@/lib/monitoring-storage';
import { classifyChange } from '@/lib/openai';

/**
 * POST /api/demo/trigger-change
 * Simulates a change detection by:
 * 1. Creating a snapshot of the "original" version
 * 2. Creating a snapshot of the "updated" version  
 * 3. Comparing them and detecting changes
 * 
 * Request body: { competitorId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorId } = body;

    if (!competitorId) {
      return NextResponse.json(
        { error: 'competitorId is required' },
        { status: 400 }
      );
    }

    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/demo/test-website`;

    console.log(`🎭 Triggering change detection for competitor ${competitorId}`);

    // Step 1: Create baseline snapshot (original version)
    const originalUrl = `${baseUrl}?version=original`;
    let baselineSnapshot = getLatestSnapshot(competitorId, originalUrl);
    
    if (!baselineSnapshot) {
      console.log('📸 Creating baseline snapshot...');
      baselineSnapshot = await createSnapshot(competitorId, originalUrl);
      saveSnapshot(baselineSnapshot);
    } else {
      console.log('✅ Using existing baseline snapshot');
    }

    // Step 2: Create new snapshot (updated version)
    console.log('📸 Creating updated snapshot...');
    const updatedUrl = `${baseUrl}?version=updated`;
    const newSnapshot = await createSnapshot(competitorId, updatedUrl);
    saveSnapshot(newSnapshot);

    // Step 3: Detect changes
    console.log('🔍 Detecting changes...');
    const detectedChange = detectChange(baselineSnapshot, newSnapshot);

    if (!detectedChange) {
      return NextResponse.json({
        success: false,
        message: 'No significant changes detected',
      });
    }

    // Step 4: Enhance with OpenAI classification
    try {
      const classification = await classifyChange(
        detectedChange.beforeExcerpt,
        detectedChange.afterExcerpt,
        updatedUrl
      );

      detectedChange.changeType = classification.changeType;
      detectedChange.severity = classification.severity;
      detectedChange.rationale = classification.rationale;
      detectedChange.recommendedActions = classification.recommendedActions;
    } catch (error) {
      console.warn('OpenAI classification failed, using default:', error);
    }

    // Step 5: Save the change
    saveChange(detectedChange);

    console.log(`✅ Change detected: ${detectedChange.changeType} (${detectedChange.severity} severity)`);

    return NextResponse.json({
      success: true,
      message: 'Change detected successfully',
      change: detectedChange,
    });
  } catch (error: any) {
    console.error('Error triggering change detection:', error);
    return NextResponse.json(
      { error: 'Failed to trigger change detection', details: error.message },
      { status: 500 }
    );
  }
}
