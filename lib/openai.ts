/**
 * OpenAI API integration for change classification and analysis
 */

import OpenAI from 'openai';

// Initialize OpenAI client lazily
let _openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY is not set. Please add it to your .env.local file and restart the server.'
      );
    }
    _openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openaiClient;
}

export const openai = {
  chat: {
    completions: {
      create: async (...args: Parameters<OpenAI['chat']['completions']['create']>) => {
        return getOpenAIClient().chat.completions.create(...args);
      },
    },
  },
} as OpenAI;

/**
 * Classify a detected change using OpenAI
 * Returns: changeType, severity, rationale, recommendedActions
 */
export async function classifyChange(
  beforeExcerpt: string,
  afterExcerpt: string,
  url: string
): Promise<{
  changeType: 'product' | 'pricing' | 'other';
  severity: 'low' | 'medium' | 'high';
  rationale: string;
  recommendedActions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a competitive intelligence analyst. Analyze website changes and classify them.
Respond with JSON only, no markdown.`,
        },
        {
          role: 'user',
          content: `Analyze this website change:

URL: ${url}
Before: ${beforeExcerpt.substring(0, 500)}
After: ${afterExcerpt.substring(0, 500)}

Classify the change:
- changeType: "product" (new products/features), "pricing" (price changes), or "other"
- severity: "high" (critical impact), "medium" (significant), or "low" (minor)
- rationale: 1-2 sentence explanation of why it matters
- recommendedActions: Array of 1-3 actionable recommendations

Return JSON:
{
  "changeType": "product" | "pricing" | "other",
  "severity": "high" | "medium" | "low",
  "rationale": "explanation here",
  "recommendedActions": ["action 1", "action 2"]
}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    return {
      changeType: result.changeType || 'other',
      severity: result.severity || 'medium',
      rationale: result.rationale || 'Change detected',
      recommendedActions: result.recommendedActions || [],
    };
  } catch (error) {
    console.error('Error classifying change with OpenAI:', error);
    // Return fallback classification
    return {
      changeType: 'other',
      severity: 'medium',
      rationale: 'Change detected on website',
      recommendedActions: ['Monitor this change closely'],
    };
  }
}
