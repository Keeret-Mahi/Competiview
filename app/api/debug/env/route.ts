import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check if environment variables are loaded
 * Remove this in production for security
 */
export async function GET() {
  const hasApiKey = !!process.env.GOOGLE_PLACES_API_KEY;
  const apiKeyLength = process.env.GOOGLE_PLACES_API_KEY?.length || 0;
  const apiKeyPrefix = process.env.GOOGLE_PLACES_API_KEY?.substring(0, 7) || 'not set';
  
  // List all env vars that contain "GOOGLE" or "PLACES" (without exposing full values)
  const relevantEnvVars = Object.keys(process.env)
    .filter(key => key.toUpperCase().includes('GOOGLE') || key.toUpperCase().includes('PLACES'))
    .map(key => ({
      name: key,
      exists: !!process.env[key],
      length: process.env[key]?.length || 0,
      prefix: process.env[key]?.substring(0, 7) || 'not set',
    }));

  return NextResponse.json({
    message: 'Environment variable debug info',
    GOOGLE_PLACES_API_KEY: {
      exists: hasApiKey,
      length: apiKeyLength,
      prefix: apiKeyPrefix,
      // Only show first few chars for verification
      firstChars: hasApiKey ? apiKeyPrefix : null,
    },
    allRelevantEnvVars: relevantEnvVars,
    note: 'Restart your Next.js dev server after adding/changing .env.local files',
    instructions: [
      '1. Make sure GOOGLE_PLACES_API_KEY is in .env.local (not .env)',
      '2. Format: GOOGLE_PLACES_API_KEY=your_key_here (no spaces around =)',
      '3. No quotes needed unless the key contains spaces',
      '4. Restart dev server: Stop and run "npm run dev" again',
    ],
  });
}
