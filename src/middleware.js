import { supabaseClient as supabase } from "./lib/supabase";

export const onRequest = async ({ cookies, redirect, url, locals }, next) => {
  // Verificamos si estamos en una ruta protegida (admin o cliente)
  const esRutaAdmin = url.pathname.startsWith("/admin");
  const esRutaCliente = url.pathname.startsWith("/cliente");

  if (esRutaAdmin || esRutaCliente) {
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

      // Consultamos la columna 'role' que existe en tu base de datos
      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("role") 
        .eq("id", user.id)
        .single();

      if (perfilError) {
        console.error("ERROR AL LEER PERFIL:", perfilError);
        cookies.delete("sb-access-token", { path: "/" });
        cookies.delete("sb-refresh-token", { path: "/" });
        return redirect("/login");
      }

      // Usamos el valor de la columna 'role'
      const role = perfil?.role || "cliente";

      console.log(
        `Middleware: Usuario ${user.id} - Rol detectado: ${role} - Accediendo a: ${url.pathname}`,
      );

      // Guardamos en locals para usarlo en otras partes de la app
      locals.user = user;
      locals.role = role;

      // ==========================
      // PROTECCIÓN DE /ADMIN
      // ==========================
      if (esRutaAdmin) {
        // Solo pueden entrar kiosco y superadmin
        if (role !== "kiosco" && role !== "superadmin") {
          console.warn(`Acceso admin denegado a ${url.pathname} para el rol: ${role}`);
          return redirect("/cliente");
        }

        // Rutas exclusivas para superadmin
        const esRutaPrivada =
          url.pathname.startsWith("/admin/finanzas") ||
          url.pathname.startsWith("/admin/libro-diario");

        if (esRutaPrivada && role !== "superadmin") {
          console.warn(`Acceso denegado a ${url.pathname} para el rol: ${role}`);
          return redirect("/admin/dashboard");
        }
      }

      // ==========================
      // PROTECCIÓN DE /CLIENTE
      // ==========================
      if (esRutaCliente) {
        if (role !== "cliente") {
          console.warn(`Acceso cliente denegado a ${url.pathname} para el rol: ${role}`);
          return redirect("/admin/dashboard");
        }
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