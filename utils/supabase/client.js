import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://izawjgcfbdfvixnqjqjg.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

if (!supabaseKey) {
  console.warn(
    "Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Supabase functionality will be limited.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey || "");
