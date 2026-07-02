// src/middleware.js (o donde tengas tu middleware)
import { supabaseClient as supabase } from "./lib/supabase";

export const onRequest = async ({ cookies, redirect, url, locals }, next) => {
  const esRutaAdmin = url.pathname.startsWith("/admin");
  const esRutaCliente = url.pathname.startsWith("/cliente");
  const esRutaCatalogo = url.pathname.startsWith("/catalogo");

  // Si no está logueado y entra a una zona protegida, al login
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");

  if ((esRutaAdmin || esRutaCliente || esRutaCatalogo) && (!accessToken || !refreshToken)) {
    return redirect("/login");
  }

  if (esRutaAdmin || esRutaCliente || esRutaCatalogo) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken.value,
        refresh_token: refreshToken.value,
      });

      if (error || !data.session?.user) {
        cookies.delete("sb-access-token", { path: "/" });
        cookies.delete("sb-refresh-token", { path: "/" });
        return redirect("/login");
      }

      const user = data.session.user;

      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (perfilError) throw perfilError;

      const role = perfil?.role || "cliente";
      locals.user = user;
      locals.role = role;

      // ==========================
      // PROTECCIÓN DE RUTAS
      // ==========================

      // 1. Si es kiosco y quiere entrar a /admin, mándalo a /catalogo
      if (role === "kiosco" && esRutaAdmin) {
        return redirect("/catalogo");
      }

      // 2. Control de acceso para ADMIN
      if (esRutaAdmin) {
        if (role !== "superadmin") {
          return redirect("/catalogo"); // Si no es superadmin, solo puede ver el catálogo
        }
        
        // Regla para rutas privadas de superadmin
        const esRutaPrivada = url.pathname.startsWith("/admin/finanzas") || url.pathname.startsWith("/admin/libro-diario");
        if (esRutaPrivada && role !== "superadmin") {
          return redirect("/admin/dashboard");
        }
      }

      // 3. Control de acceso para CLIENTE
      if (esRutaCliente && role !== "cliente") {
        return redirect("/catalogo");
      }

      // 4. Control de acceso para CATÁLOGO
      if (esRutaCatalogo && (role !== "kiosco" && role !== "superadmin")) {
        return redirect("/cliente");
      }

    } catch (err) {
      console.error("Error en middleware:", err);
      return redirect("/login");
    }
  }

  return next();
};