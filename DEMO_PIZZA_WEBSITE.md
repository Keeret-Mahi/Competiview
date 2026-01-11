# Demo Pizza Website

## Overview

This is a demo pizza restaurant website that lives within your Next.js app. It's designed to demonstrate the change detection system by allowing you to trigger changes that the monitoring system can detect.

## How It Works

1. **Demo Website**: Visit `/demo/pizza-website` to see the pizza restaurant website
2. **Trigger Changes**: Click buttons to add products, change prices, or add special offers
3. **Monitor Changes**: Point the monitoring system to `http://localhost:3000/api/demo/pizza-website`
4. **Detect Changes**: The change detection system will scrape the HTML and detect any changes

## Architecture

### State Management

- **State API**: `/api/demo/pizza-website-state`
  - `GET`: Returns current state (products, prices, special offers)
  - `POST`: Updates state (add-product, change-price, add-special, reset)

- **HTML API**: `/api/demo/pizza-website`
  - `GET`: Returns HTML representation of the current state
  - This is what the monitoring system scrapes

- **UI Page**: `/demo/pizza-website`
  - React component that displays the pizza website
  - Has buttons to trigger changes
  - Shows current state and version

### State Storage

The state is stored in-memory (resets on server restart). This is perfect for demos!

## Usage for Demo

### Step 1: Add the Demo Website as a Competitor

1. Go to `/competitors`
2. Click "Add Competitor"
3. Enter:
   - **Name**: "Demo Pizza Website"
   - **Domain**: `http://localhost:3000/api/demo/pizza-website` (for scraping)
   - Or use the UI page: `http://localhost:3000/demo/pizza-website` (to view/manage)

### Step 2: Create Initial Snapshot

Call the monitoring API to create an initial snapshot:
```bash
curl -X POST http://localhost:3000/api/monitoring/snapshot \
  -H "Content-Type: application/json" \
  -d '{
    "competitorId": "comp-demo-pizza",
    "url": "http://localhost:3000/api/demo/pizza-website"
  }'
```

### Step 3: Trigger a Change

1. Visit `/demo/pizza-website`
2. Click one of the buttons:
   - **"Add New Product"** - Adds a new pizza to the menu
   - **"Change Price"** - Changes a random pizza's price (10-20% change)
   - **"Add Special Offer"** - Adds a special offer banner
   - **"Reset to Original"** - Resets everything back to original state

### Step 4: Detect the Change

Call the monitoring API to check for changes:
```bash
curl -X POST http://localhost:3000/api/monitoring/check-changes \
  -H "Content-Type: application/json" \
  -d '{
    "competitorId": "comp-demo-pizza",
    "url": "http://localhost:3000/api/demo/pizza-website"
  }'
```

The system will:
1. Create a new snapshot
2. Compare it with the previous snapshot
3. Detect changes (new product, price change, etc.)
4. Classify the change with AI
5. Return the detected change

### Step 5: View the Change

1. Go to `/competitors/comp-demo-pizza`
2. See the detected change in the appropriate section:
   - **Product Updates**: New products added
   - **Pricing Updates**: Price changes
   - **Other Updates**: Special offers, etc.

## Demo Flow Suggestions

### For Hackathon Demo:

1. **Show the pizza website**: Visit `/demo/pizza-website`
   - "Here's a competitor's pizza website we're monitoring"

2. **Show initial state**: Point out the current menu items and prices

3. **Trigger a change**: Click "Add New Product"
   - "Let's see what happens when they add a new product..."

4. **Show the monitoring system**: Go to competitor detail page
   - "Our system detected this change..."
   - Show the before/after comparison
   - Show the AI analysis

5. **Trigger another change**: Go back, click "Change Price"
   - "What about when they change prices?"
   - Show the pricing change detection

6. **Show the recommendations**: Highlight the AI recommendations
   - "Here's what you should do about this change..."

## Technical Details

### State Structure

```typescript
{
  version: number,           // Increments with each change
  products: Array<{
    id: number,
    name: string,
    price: string,
    description: string
  }>,
  specialOffer: string | null,
  lastChange: string | null  // ISO timestamp
}
```

### Available Actions

- `add-product`: Adds a random new pizza product
- `change-price`: Changes a random product's price by 10-20%
- `add-special`: Adds a random special offer
- `reset`: Resets to original state

### HTML Rendering

The `/api/demo/pizza-website` endpoint renders the state as HTML so it can be scraped. The HTML includes:
- All products with names, prices, descriptions
- Special offers (if any)
- Restaurant info

---

**Perfect for hackathon demos! 🚀**
