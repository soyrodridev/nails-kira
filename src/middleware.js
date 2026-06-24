import { supabaseClient as supabase } from "./lib/supabase";

export const onRequest = async ({ cookies, redirect, url, locals }, next) => {
  if (url.pathname.startsWith("/admin")) {
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");

    if (!accessToken || !refreshToken) {
      return redirect("/login");
    }

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

      if (perfilError) {
        console.error("ERROR AL LEER PERFIL:", perfilError);
      } else {
        console.log("DATO CRUDO DE LA TABLA:", perfil);
      }

      // Si falla la consulta, asignamos "kiosco" para no romper el flujo
      const role = perfilError ? "kiosco" : perfil?.role || "kiosco";

      // Log de depuración para ver qué está detectando el middleware
      console.log(
        `Middleware: Usuario ${user.id} - Rol detectado: ${role} - Accediendo a: ${url.pathname}`,
      );

      // Guardamos el usuario y rol
      locals.user = user;
      locals.role = role;

      // Proteger rutas de finanzas
      const esRutaPrivada =
        url.pathname.startsWith("/admin/finanzas") ||
        url.pathname.startsWith("/admin/libro-diario");

      if (esRutaPrivada && role !== "superadmin") {
        console.warn(`Acceso denegado a ${url.pathname} para el rol: ${role}`);
        return redirect("/admin/dashboard");
      }
    } catch (err) {
      console.error("Error crítico en middleware:", err);
      cookies.delete("sb-access-token", { path: "/" });
      cookies.delete("sb-refresh-token", { path: "/" });
      return redirect("/login");
    }
  }

  return next();
};
