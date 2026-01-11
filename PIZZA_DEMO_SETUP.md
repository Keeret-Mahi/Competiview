# Pizza Demo Setup Guide

## IMPORTANT: Correct URL

**Use this URL for monitoring:**
```
http://localhost:3000/api/demo/pizza-website
```

**NOT this URL (the React page):**
```
http://localhost:3000/demo/pizza-website
```

## Why?

- `/api/demo/pizza-website` returns HTML directly (can be scraped by server)
- `/demo/pizza-website` is a React page (requires JavaScript, can't be scraped properly)
- Both use the same global state, so they're always in sync

## Step-by-Step Demo Flow

1. **Add the competitor with the correct URL:**
   - Go to `/competitors`
   - Click "Add Competitor"
   - Name: "Demo Pizza Website"
   - Domain/URL: `http://localhost:3000/api/demo/pizza-website` ← **THIS IS THE CORRECT URL**

2. **Create initial snapshot:**
   - Go to the competitor detail page (`/competitors/[id]`)
   - Click "Check for Changes" button
   - This creates the first snapshot (you'll see "First snapshot created" message)
   - ✅ This is expected - there's nothing to compare against yet

3. **Make a change:**
   - Go to `/demo/pizza-website` (the React page)
   - Click "➕ Add New Product" button
   - Wait for the pizza to be added (you should see 4 pizzas instead of 3)

4. **Detect the change:**
   - Go back to the competitor detail page
   - Click "Check for Changes" button again
   - ✅ You should now see the change detected!

## Troubleshooting

- **If you see "First snapshot created":** This is normal on the first check. Add a pizza, then check again.
- **If you see "No changes detected":** The similarity threshold is 85%. Make sure you added a pizza and wait a moment before checking.
- **If changes still don't appear:** Check the server console (terminal) for error messages.
