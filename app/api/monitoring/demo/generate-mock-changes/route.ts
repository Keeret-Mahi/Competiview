import { NextRequest, NextResponse } from 'next/server';
import { saveChange, getLatestSnapshot, saveSnapshot } from '@/lib/monitoring-storage';
import type { DetectedChange, WebsiteSnapshot } from '@/lib/change-detection';

/**
 * POST /api/monitoring/demo/generate-mock-changes
 * Generates mock changes for demo purposes
 * 
 * Request body: { competitorId: string, url: string, count?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorId, url, count = 3 } = body;

    if (!competitorId || !url) {
      return NextResponse.json(
        { error: 'competitorId and url are required' },
        { status: 400 }
      );
    }

    console.log(`🎭 Generating ${count} mock changes for competitor ${competitorId}`);

    // Mock change templates
    const mockChanges: Partial<DetectedChange>[] = [
      {
        changeType: 'pricing',
        severity: 'high',
        beforeExcerpt: 'Enterprise Plan: Starting at $5,000 / month. Includes all features with priority support.',
        afterExcerpt: 'Enterprise Plan: Starting at $4,250 / month. Includes all features with priority support. Limited time offer!',
        rationale: 'Significant price reduction detected on Enterprise tier. This aggressive pricing strategy could impact market share.',
        recommendedActions: [
          'Review our pricing strategy for Enterprise tier',
          'Monitor customer feedback on competitor pricing',
          'Consider value-added features to differentiate',
        ],
      },
      {
        changeType: 'product',
        severity: 'medium',
        beforeExcerpt: 'Our platform offers powerful analytics and reporting tools.',
        afterExcerpt: 'NEW: Introducing AI-Powered Insights. Our platform now offers powerful analytics, reporting tools, and AI-driven recommendations.',
        rationale: 'New AI feature launched that directly competes with our core analytics offering.',
        recommendedActions: [
          'Evaluate AI integration opportunities',
          'Highlight our unique competitive advantages',
          'Monitor customer reaction to new feature',
        ],
      },
      {
        changeType: 'product',
        severity: 'low',
        beforeExcerpt: 'Available integrations: Slack, Microsoft Teams, Zapier.',
        afterExcerpt: 'Available integrations: Slack, Microsoft Teams, Zapier, Discord, Notion. More coming soon!',
        rationale: 'Additional integration options added, expanding platform connectivity.',
        recommendedActions: [
          'Review our integration roadmap',
          'Assess demand for new integrations',
        ],
      },
      {
        changeType: 'pricing',
        severity: 'medium',
        beforeExcerpt: 'Starter Plan: $29/month. Pro Plan: $99/month.',
        afterExcerpt: 'Starter Plan: $29/month. Pro Plan: $89/month. New Annual Plans: Save 20% with annual billing!',
        rationale: 'Pricing adjustments and new annual billing option introduced.',
        recommendedActions: [
          'Analyze impact on customer acquisition',
          'Consider annual billing promotions',
        ],
      },
      {
        changeType: 'other',
        severity: 'low',
        beforeExcerpt: 'We are hiring! Join our growing team.',
        afterExcerpt: 'We are hiring! Join our growing team. New positions: Senior Engineer, Product Manager, Customer Success.',
        rationale: 'Active hiring suggests company growth and expansion.',
        recommendedActions: [
          'Monitor for product/service expansion signals',
          'Track hiring patterns for strategic insights',
        ],
      },
    ];

    // Get or create a base snapshot
    let baseSnapshot = getLatestSnapshot(competitorId, url);
    if (!baseSnapshot) {
      // Create a mock snapshot
      baseSnapshot = {
        id: `snap-demo-${Date.now()}`,
        competitorId,
        url,
        title: 'Demo Snapshot',
        normalizedText: 'Base snapshot content for demo purposes',
        contentHash: 'demo-hash-base',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      };
      saveSnapshot(baseSnapshot);
    }

    // Generate mock changes
    const generatedChanges: DetectedChange[] = [];
    const selectedMockChanges = mockChanges.slice(0, count);

    for (let i = 0; i < selectedMockChanges.length; i++) {
      const mockChange = selectedMockChanges[i];
      const detectedAt = new Date(Date.now() - (i + 1) * 3600000); // Stagger changes by hours

      const change: DetectedChange = {
        id: `change-demo-${competitorId}-${Date.now()}-${i}`,
        competitorId,
        url,
        oldSnapshotId: baseSnapshot.id,
        newSnapshotId: `snap-demo-new-${Date.now()}-${i}`,
        changeType: mockChange.changeType!,
        severity: mockChange.severity!,
        beforeExcerpt: mockChange.beforeExcerpt!,
        afterExcerpt: mockChange.afterExcerpt!,
        similarityScore: mockChange.changeType === 'pricing' ? 0.75 : 0.85,
        diffSummary: `Change detected: ${mockChange.changeType} update`,
        rationale: mockChange.rationale!,
        recommendedActions: mockChange.recommendedActions!,
        detectedAt,
      };

      saveChange(change);
      generatedChanges.push(change);
    }

    console.log(`✅ Generated ${generatedChanges.length} mock changes`);

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedChanges.length} mock changes`,
      changes: generatedChanges,
    });
  } catch (error: any) {
    console.error('Error generating mock changes:', error);
    return NextResponse.json(
      { error: 'Failed to generate mock changes', details: error.message },
      { status: 500 }
    );
  }
}
