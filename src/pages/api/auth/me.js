// src/pages/api/auth/me.js

export const prerender = false;
import { supabaseClient as supabase } from "../../../lib/supabase";

export async function GET({ cookies }) {
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({ user: null }), {
      status: 401,
    });
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
  });

  if (error || !data.session) {
    return new Response(JSON.stringify({ user: null }), {
      status: 401,
    });
  }

  return new Response(
    JSON.stringify({
      user: data.session.user,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}