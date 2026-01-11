# Menu Monitoring Implementation Guide

## Overview
This implementation adds structured menu monitoring to Competiview, specifically for detecting:
1. **Product Updates** - New menu items added
2. **Price Updates** - Price changes for existing items

## Architecture

### Data Flow
1. **Menu Parsing** (`lib/menu-parser.ts`)
   - Extracts structured menu items from HTML
   - Normalizes prices (handles "$14", "$15.40", etc.)
   - Generates stable keys (uses product ID if available, otherwise normalized name)

2. **Menu Diffing** (`lib/menu-diff.ts`)
   - Compares old vs new menu snapshots
   - Generates `UpdateEvent[]` with type `PRODUCT_ADDED` or `PRICE_CHANGED`

3. **Storage** (`lib/monitoring-storage.ts`)
   - Extended to store `UpdateEvent[]` in memory
   - Events persist until server restart (in-memory storage)

4. **API Endpoints**
   - `POST /api/monitoring/menu/check-now` - Manual check trigger
   - `GET /api/monitoring/updates` - Fetch all update events

5. **UI** (`app/dashboard/page.tsx` + `components/dashboard/UpdatesFeed.tsx`)
   - New "Menu Updates" section on dashboard
   - "Check Now" button
   - Two columns: "Product Updates" and "Price Updates"

## Files Changed/Added

### New Files
- `lib/menu-parser.ts` - Menu parsing from HTML
- `lib/menu-diff.ts` - Menu comparison and event generation
- `app/api/monitoring/menu/check-now/route.ts` - Manual check API
- `app/api/monitoring/updates/route.ts` - Fetch updates API
- `components/dashboard/UpdatesFeed.tsx` - UI component for updates

### Modified Files
- `lib/change-detection.ts` - Extended `WebsiteSnapshot` to include `menuItems`
- `lib/monitoring-storage.ts` - Added `UpdateEvent` storage functions
- `app/dashboard/page.tsx` - Added `UpdatesFeed` component and check handler

## Setup & Run Instructions

1. **Install dependencies** (if needed):
   ```bash
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Access dashboard**:
   - Open http://localhost:3000/dashboard
   - You'll see the new "Menu Updates" section

## How to Demo

### Initial Setup
1. **Open dashboard**: http://localhost:3000/dashboard
2. **First check**: Click "Check Now" button
   - This creates the initial snapshot (no events will show)
   - Console will log: "First snapshot created - no changes to detect"

### Demo: Product Addition
1. **Open pizza website**: http://localhost:3000/demo/pizza-website
   - OR http://localhost:3000/api/demo/pizza-website (direct HTML)
2. **Add a pizza**: Click the "➕ Add New Product" button
   - A new pizza menu item will be added
3. **Check for changes**: Go back to dashboard, click "Check Now"
4. **View result**: You should see a new card in "Product Updates" section:
   - Shows: "New product added at $XX.XX"
   - Displays competitor name, item name, timestamp

### Demo: Price Change
1. **Open pizza website**: http://localhost:3000/demo/pizza-website
2. **Change a price**: Click on any pizza's price (the $XX number)
   - Price will change by 10-20%
3. **Check for changes**: Go back to dashboard, click "Check Now"
4. **View result**: You should see a new card in "Price Updates" section:
   - Shows: "Price updated: $OLD → $NEW"
   - Displays old price (strikethrough) and new price

## Technical Details

### Menu Item Structure
```typescript
interface MenuItem {
  key: string;        // Stable ID: "id-1" or "veggie-supreme"
  name: string;       // "Veggie Supreme"
  price: number;      // 15.00 (normalized)
  description?: string;
  productId?: string; // "1", "2", etc.
}
```

### Update Event Structure
```typescript
interface UpdateEvent {
  id: string;
  competitorId: string;
  competitorName: string;
  url: string;
  type: 'PRODUCT_ADDED' | 'PRICE_CHANGED';
  createdAt: Date;
  payload: {
    itemKey: string;
    itemName: string;
    oldPrice?: number;  // For PRICE_CHANGED
    newPrice?: number;  // For PRICE_CHANGED
    price?: number;     // For PRODUCT_ADDED
    description?: string;
  };
}
```

### Key Matching Strategy
1. **Prefer Product ID**: If HTML has `data-product-id`, use `id-{productId}` as key
2. **Fallback to Name**: Otherwise, normalize name: lowercase, remove punctuation, replace spaces with hyphens
3. **This ensures**:
   - Same product always has same key
   - Product additions are detected (key in NEW but not OLD)
   - Price changes are detected (key in both, price differs)

### Price Normalization
- Strips: `$`, commas, spaces
- Parses as float
- Rounds to 2 decimal places
- Handles: "$14", "$15.40", "14.00", "14"

### HTML Parsing
The parser looks for:
- Product blocks: `<div class="product">...</div>`
- Product names: `<h3 class="product-name">...</h3>`
- Prices: `<span class="product-price" data-product-id="X">$XX</span>`
- Descriptions: `<p class="product-description">...</p>`

## Debugging

### Check Server Logs
When you click "Check Now", server logs show:
```
🚨 POST /api/monitoring/menu/check-now called
🔍 Checking 1 competitor(s)...
📸 Checking competitor: Slice & Wood Pizzeria (http://localhost:3000/api/demo/pizza-website)
📋 Found 4 product blocks
✅ Parsed 4 menu items: The Margherita - $14, Pepperoni Classic - $16, ...
✅ New snapshot created for Slice & Wood Pizzeria
🔍 Diffing menus: 3 old items vs 4 new items
➕ PRODUCT_ADDED: Veggie Supreme at $15
✅ Generated 1 update events
✅ Saved 1 update events. Total events: 1
✅ Checked Slice & Wood Pizzeria: 1 events
✅ Check complete: 1 total events across 1 competitor(s)
```

### Common Issues

1. **No events showing**: 
   - Make sure you clicked "Check Now" at least twice (first creates baseline)
   - Check browser console for errors
   - Check server logs for parsing errors

2. **Wrong price format**:
   - Parser expects `$XX` or `$XX.XX` format
   - If prices aren't detected, check HTML structure matches expected selectors

3. **Product IDs not matching**:
   - Parser tries to find `data-product-id` attributes
   - Falls back to name-based keys if IDs not found
   - Name-based keys should still work but are less stable

## Future Enhancements

1. **Persistent Storage**: Replace in-memory storage with database (Supabase/Postgres)
2. **Cron Job**: Add scheduled checks (Vercel Cron)
3. **Multiple Competitors**: Already supports multiple, just add more to competitors array
4. **Email Notifications**: Send alerts when events detected
5. **Change History**: Track price history over time

## API Reference

### POST /api/monitoring/menu/check-now
**Body:**
```json
{
  "competitors": [
    {
      "id": "pizza-demo",
      "name": "Slice & Wood Pizzeria",
      "domain": "http://localhost:3000/api/demo/pizza-website"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "checkedAt": "2024-01-11T...",
  "totalEvents": 1,
  "results": [
    {
      "competitorId": "pizza-demo",
      "competitorName": "Slice & Wood Pizzeria",
      "events": [...],
      "message": "Found 1 update(s)"
    }
  ]
}
```

### GET /api/monitoring/updates
**Query params:** `competitorId` (optional)

**Response:**
```json
{
  "events": [...],
  "productUpdates": [...],
  "priceUpdates": [...],
  "total": 5
}
```
