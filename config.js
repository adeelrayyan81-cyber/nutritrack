/* ============================================================
   NutriTrack settings. This is the ONLY file you need to edit.
   Leave a value as "" and the app still works; that feature just
   runs in its built-in (offline) mode until you fill it in.
   ============================================================ */
window.NT_CONFIG = {
  // Free key from https://api.data.gov/signup (takes 1 minute).
  // "DEMO_KEY" works too, but is limited to about 30 searches an hour per person.
  USDA_API_KEY: "DEMO_KEY",

  // From Supabase → Project Settings → API (see README, step 3).
  SUPABASE_URL: "https://eilynmnxxweurypzgxry.supabase.co",
  SUPABASE_KEY: "sb_publishable_cQx383uU0p5z2awaqyfXWQ_rjMmk4Wx", // the "publishable" / "anon" key, never the secret one

  // Your AI function URL, e.g. https://xxxx.supabase.co/functions/v1/ai (README, step 4)
  AI_ENDPOINT: "https://eilynmnxxweurypzgxry.supabase.co/functions/v1/ai",

  INSTAGRAM: "nutri_trackapp"
};
