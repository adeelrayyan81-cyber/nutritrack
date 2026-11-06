# NutriTrack

Your nutrition companion: USDA-based food tracking, barcode and photo scanning, recipes (by goal or by the ingredients you have), week types (Light, Medium, Busy and Ramadan), nutrition points, reminders, a friends leaderboard and an AI coach. It works on phones and computers and can be added to your Home Screen like an app.

Everything already works with no setup. Steps 2–4 switch on the extras.

---

## Step 1: Put the app online (free, about 5 minutes)

1. Sign in at **github.com** and click **+ → New repository**.
2. Name it `nutritrack`, choose **Public**, then click **Create repository**.
3. On the new page, click **uploading an existing file**.
4. Unzip `nutritrack.zip` on your computer. Open the folder, select **everything inside it** (index.html, the css folder, the js folder and the rest), and drag it all onto the GitHub page. Don't drag the outer folder itself.
5. Click **Commit changes**.
6. Go to **Settings → Pages**. Under *Branch*, choose **main** and **/ (root)**, then click **Save**.
7. Wait 1–2 minutes and refresh. Your link appears at the top: `https://YOUR-USERNAME.github.io/nutritrack/`

Send that link to friends and family.

**On a phone:**

- **iPhone:** open the link in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** open the link in Chrome, tap **⋮**, then **Install app**.

> The camera scanner needs this https link. It won't work if you open index.html straight from your computer.

## Step 2: Your own USDA key (recommended, 1 minute)

The app uses USDA's shared `DEMO_KEY`, which allows about 30 searches an hour per person.

1. Get a free key at **https://api.data.gov/signup**. It arrives instantly by email.
2. On GitHub, open `config.js`, click the ✏️ pencil, and paste the key between the quotes after `USDA_API_KEY:`.
3. Click **Commit changes**.

## Step 3: Turn on the shared leaderboard (free, about 10 minutes)

1. Create a free account at **supabase.com**, then click **New project**. Any name and password work, and the free plan is fine.
2. When it's ready, open **SQL Editor**, paste everything from `supabase/setup.sql`, and click **Run**.
3. Go to **Project Settings → API Keys**. Copy the **Project URL** and the **publishable** key (it may be called *anon public*). **Never** use the *secret* / *service_role* key.
4. In `config.js` on GitHub, paste them into `SUPABASE_URL` and `SUPABASE_KEY`, then commit.

Everyone who sets a display name on **My Stats** now shows up on the leaderboard.

## Step 4: Turn on the AI (free, about 10 minutes)

This step powers the AI greeting, AI chat, AI recipe ideas and food photo recognition. Until you do it, a built-in coach answers instead.

1. Get a free Gemini API key at **https://aistudio.google.com/apikey**.
2. In Supabase, open **Edge Functions → Deploy a new function → Via Editor**.
3. Name the function `ai`, replace the sample code with everything in `supabase/functions/ai/index.ts`, and click **Deploy**.
4. In the function's settings, turn **off** "Verify JWT" (also called *Enforce JWT verification*) and save.
5. Go to **Edge Functions → Secrets** and add a secret named `GEMINI_API_KEY` with your key as the value.
6. Copy the function URL (it looks like `https://xxxx.supabase.co/functions/v1/ai`), paste it into `AI_ENDPOINT` in `config.js`, and commit.

Two things to know about Gemini's free tier. Google may use what people send, including photos and chat messages, to improve its products. It also has daily limits. If Google renames the model, add a secret `GEMINI_MODEL` with the new name.

## Your logo

- **Quick option:** on **My Stats → App logo**, upload your logo. This only changes it on that one device.
- **For everyone:** replace the files in the `icons` folder on GitHub with your logo, keeping the same file names and sizes (`icon-192.png` is 192×192, `icon-512.png` is 512×512, `maskable-512.png` is 512×512 with extra padding, `apple-touch-icon.png` is 180×180).

## Making changes later

Edit any file on GitHub with the ✏️ pencil and commit. The live app updates within a minute or two. Refresh the page to see it.

## Where the numbers come from

- **Foods:** USDA FoodData Central, searched live. The app also has 67 common foods built in so it works offline. 35 of them carry their FoodData Central ID, and the rest are USDA SR Legacy reference values.
- **Barcodes:** USDA FoodData Central's branded foods database. If a product isn't there, the app uses the Nutrition Facts label from Open Food Facts and says so.
- **Daily targets:** Mifflin-St Jeor equation; protein from the USDA RDA (0.8 g/kg); fiber from the Dietary Guidelines (14 g per 1,000 kcal); FDA Daily Values for sodium (2,300 mg) and added sugar (50 g). Users under 18 never get a calorie deficit.
- **Points:** more for protein, fiber, fruits, vegetables, whole grains and beans; fewer for added sugar, saturated fat and sodium. Water, completed reminders and logging 3 meals a day add bonuses, and the week type adjusts the scoring.

## Files

| File | What it is |
| --- | --- |
| `config.js` | Your keys and settings (the only file you need to edit) |
| `index.html`, `css/`, `js/` | The app |
| `data/foods.js`, `data/recipes.js` | Built-in foods and 24 recipes |
| `sw.js`, `manifest.webmanifest`, `icons/` | Make it installable and work offline |
| `supabase/` | Leaderboard table and AI function |
| `vendor/` | Barcode scanner library (html5-qrcode, Apache 2.0) |
