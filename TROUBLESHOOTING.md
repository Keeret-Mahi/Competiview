# Troubleshooting Environment Variables

## Issue: GOOGLE_PLACES_API_KEY not being read

### Quick Checks:

1. **File Location**: `.env.local` must be in the root directory (same level as `package.json`)
   ```bash
   ls -la .env.local  # Should exist in root
   ```

2. **File Format** (no spaces, no quotes):
   ```
   ✅ CORRECT: GOOGLE_PLACES_API_KEY=AIzaSyC...
   ❌ WRONG:   GOOGLE_PLACES_API_KEY = AIzaSyC...  (spaces around =)
   ❌ WRONG:   GOOGLE_PLACES_API_KEY="AIzaSyC..."  (quotes)
   ❌ WRONG:   GOOGLE_PLACES_API_KEY = "AIzaSyC..."  (spaces + quotes)
   ```

3. **No trailing spaces**:
   ```
   ✅ CORRECT: GOOGLE_PLACES_API_KEY=AIzaSyC...
   ❌ WRONG:   GOOGLE_PLACES_API_KEY=AIzaSyC...   (trailing space)
   ```

4. **Server Restart**: After creating/modifying `.env.local`, you MUST restart:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev  # Start again
   ```

### Debug Steps:

1. **Check server console logs** - Look for these debug messages when the API is called:
   ```
   🔍 Debug - GOOGLE_PLACES_API_KEY exists: true/false
   🔍 Debug - Key length: 39
   ```

2. **Test the debug endpoint**:
   Visit: `http://localhost:3000/api/debug/env`
   This will show if the env var is loaded without exposing the full key.

3. **Verify file encoding**:
   Make sure `.env.local` is UTF-8 encoded (no BOM):
   ```bash
   file .env.local
   ```

4. **Check for hidden characters**:
   ```bash
   cat -A .env.local | grep GOOGLE_PLACES
   # Should show: GOOGLE_PLACES_API_KEY=AIzaSyC...$
   # If you see weird characters, that's the issue
   ```

5. **Try with quotes** (sometimes needed if key has special chars):
   ```bash
   GOOGLE_PLACES_API_KEY="AIzaSyC..."
   ```
   Then restart server.

### Common Issues:

#### Issue 1: File not in root
**Symptom**: Env var never loads
**Fix**: Move `.env.local` to project root (same directory as `package.json`)

#### Issue 2: Server not restarted
**Symptom**: Old value or undefined
**Fix**: Stop server completely, then `npm run dev` again

#### Issue 3: Typo in variable name
**Symptom**: Variable doesn't exist
**Fix**: Check exact spelling: `GOOGLE_PLACES_API_KEY` (all caps, underscores)

#### Issue 4: Spaces around =
**Symptom**: Variable might be set but empty
**Fix**: Remove spaces: `GOOGLE_PLACES_API_KEY=value` not `GOOGLE_PLACES_API_KEY = value`

#### Issue 5: File encoding issue
**Symptom**: Variable exists but has weird characters
**Fix**: Recreate file with UTF-8 encoding (no BOM)

### Next.js Specific Notes:

- `.env.local` is automatically loaded by Next.js (no config needed)
- Only available in **server-side code** (API routes, Server Components)
- NOT available in client-side code (browser)
- Must restart dev server after changes
- Variables are loaded at server start time

### Still Not Working?

1. Check the server console output (where `npm run dev` is running)
2. Look for the debug messages I added
3. Visit `/api/debug/env` to see what's detected
4. Try creating a fresh `.env.local` file:
   ```bash
   echo "GOOGLE_PLACES_API_KEY=your_key_here" > .env.local
   ```
5. Then restart the server
