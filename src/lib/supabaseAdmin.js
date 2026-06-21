// src/lib/supabaseAdmin.js
import { createClient } from "@supabase/supabase-js";

console.log("URL:", import.meta.env.PUBLIC_SUPABASE_URL);
console.log(
  "SERVICE ROLE:",
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    ? "CARGADA"
    : "NO CARGADA"
);

export const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);