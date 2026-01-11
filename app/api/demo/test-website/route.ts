import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/demo/test-website
 * A demo website endpoint that simulates a competitor website
 * You can modify the content here to trigger change detection
 * 
 * Query params:
 * - version: "original" (default) or "updated" - to simulate changes
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const version = searchParams.get('version') || 'original';

  // Original version (baseline)
  const originalContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Competitor - Analytics Platform</title>
  <meta name="description" content="Powerful analytics platform for your business">
</head>
<body>
  <header>
    <h1>Analytics Platform</h1>
    <nav>
      <a href="/pricing">Pricing</a>
      <a href="/features">Features</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <section>
      <h2>Pricing Plans</h2>
      <div class="pricing">
        <div class="plan">
          <h3>Starter Plan</h3>
          <p class="price">$29/month</p>
          <ul>
            <li>Up to 10,000 events</li>
            <li>Basic analytics</li>
            <li>Email support</li>
          </ul>
        </div>
        <div class="plan">
          <h3>Pro Plan</h3>
          <p class="price">$99/month</p>
          <ul>
            <li>Up to 100,000 events</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
          </ul>
        </div>
        <div class="plan">
          <h3>Enterprise Plan</h3>
          <p class="price">Starting at $5,000 / month</p>
          <ul>
            <li>Unlimited events</li>
            <li>All features</li>
            <li>Dedicated support</li>
          </ul>
        </div>
      </div>
    </section>
    <section>
      <h2>Features</h2>
      <ul>
        <li>Real-time analytics</li>
        <li>Custom dashboards</li>
        <li>Data exports</li>
      </ul>
    </section>
  </main>
</body>
</html>
  `.trim();

  // Updated version (with changes)
  const updatedContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Competitor - Analytics Platform</title>
  <meta name="description" content="Powerful analytics platform with AI insights for your business">
</head>
<body>
  <header>
    <h1>Analytics Platform</h1>
    <nav>
      <a href="/pricing">Pricing</a>
      <a href="/features">Features</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <section>
      <h2>NEW: AI-Powered Insights</h2>
      <p>Introducing our latest feature: AI-powered analytics recommendations!</p>
    </section>
    <section>
      <h2>Pricing Plans</h2>
      <div class="pricing">
        <div class="plan">
          <h3>Starter Plan</h3>
          <p class="price">$29/month</p>
          <ul>
            <li>Up to 10,000 events</li>
            <li>Basic analytics</li>
            <li>Email support</li>
          </ul>
        </div>
        <div class="plan">
          <h3>Pro Plan</h3>
          <p class="price">$89/month</p>
          <ul>
            <li>Up to 100,000 events</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
          </ul>
        </div>
        <div class="plan">
          <h3>Enterprise Plan</h3>
          <p class="price">Starting at $4,250 / month</p>
          <ul>
            <li>Unlimited events</li>
            <li>All features including AI insights</li>
            <li>Dedicated support</li>
          </ul>
        </div>
      </div>
    </section>
    <section>
      <h2>Features</h2>
      <ul>
        <li>Real-time analytics</li>
        <li>Custom dashboards</li>
        <li>Data exports</li>
        <li>AI-powered insights (NEW)</li>
        <li>Discord integration (NEW)</li>
      </ul>
    </section>
  </main>
</body>
</html>
  `.trim();

  const content = version === 'updated' ? updatedContent : originalContent;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
