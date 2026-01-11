# Demo Guide for Hackathon

## Quick Demo Setup

For your hackathon demo, you can simulate real website changes or generate mock data.

### Option 1: Simulate Real Change Detection (Recommended for Demo)

This demonstrates actual change detection by scraping a test website:

1. **Navigate to any competitor detail page** (click on a competitor card from `/competitors`)
2. **Click the "Simulate Real Change" button** (blue button, top right)
3. The system will:
   - Create a baseline snapshot of the demo website
   - Scrape the "updated" version
   - Detect the changes (pricing, products, features)
   - Classify them with AI
   - Show realistic before/after comparisons

**What it detects:**
- Price changes (Enterprise: $5,000 → $4,250/month)
- New features (AI-powered insights, Discord integration)
- Product updates (new pricing tiers, annual billing)

### Option 2: Generate Mock Data (Quick Demo)

For instant demo data without waiting:

1. **Navigate to any competitor detail page**
2. **Click the "Generate Mock Data" button** (purple button, top right)
3. Instantly creates 5 realistic mock changes:
   - Product updates (new features)
   - Pricing changes (price updates)
   - Other updates (hiring, announcements, etc.)

### Option 2: Use the API Directly

You can also call the API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/monitoring/demo/generate-mock-changes \
  -H "Content-Type: application/json" \
  -d '{
    "competitorId": "comp-123",
    "url": "https://example.com",
    "count": 5
  }'
```

## Demo Flow

### 1. Onboarding (if needed)
- Go through the onboarding flow
- Add your business info
- Select competitors (or use existing ones)

### 2. View Competitors
- Navigate to `/competitors`
- See the grid of competitor cards

### 3. Generate Demo Data
- Click on any competitor
- **Option A**: Click "Simulate Real Change" button (demonstrates real scraping & detection)
- **Option B**: Click "Generate Mock Data" button (instant demo data)
- Wait a few seconds for changes to generate

### 4. View Changes
- Navigate through the three sections:
  - **Product Updates**: New features/products launched
  - **Pricing Updates**: Price changes detected
  - **Other Updates**: Other significant changes

### 5. Show Features
- **Change Detection**: Show how changes are detected and classified
- **AI Analysis**: Show the rationale and recommended actions
- **Before/After**: Show the diff view with before/after excerpts
- **Severity Levels**: Highlight different severity levels (High/Medium/Low)

## What the Mock Changes Include

The demo generator creates realistic changes like:

- **Pricing Changes**:
  - Price reductions (15% discount)
  - New pricing tiers
  - Annual billing options

- **Product Updates**:
  - New feature launches (AI-powered tools)
  - Integration additions
  - Platform updates

- **Other Changes**:
  - Hiring announcements
  - Company news
  - Service expansions

Each change includes:
- AI-generated rationale (why it matters)
- Recommended actions (what to do)
- Before/After excerpts
- Severity classification
- Timestamp

## Tips for Your Demo

1. **Start Fresh**: Clear browser localStorage if you want a clean demo
   ```javascript
   localStorage.clear();
   ```

2. **Generate Changes Early**: Generate mock changes before your demo starts

3. **Tell a Story**: 
   - "Let's monitor this competitor..."
   - "Look what we detected!"
   - "Here's what we recommend..."

4. **Highlight Key Features**:
   - Automatic change detection
   - AI-powered analysis
   - Actionable recommendations
   - Real-time monitoring

5. **Show the Full Flow**:
   - Discovery → Monitoring → Detection → Analysis → Action

## Troubleshooting

If changes don't appear:
1. Make sure you clicked "Generate Demo Changes"
2. Refresh the page
3. Check browser console for errors
4. Verify the competitor ID is correct

---

**Good luck with your hackathon demo! 🚀**
