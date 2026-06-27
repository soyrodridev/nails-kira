import { useState, useEffect, useRef } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function Topbar({
  title = "Dashboard",
  username = "Administrador",
  onMenuClick,
}) {
  const inicial = username.trim().charAt(0).toUpperCase() || "A";

  const [notificaciones, setNotificaciones] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Cargar las notificaciones iniciales (No leídas)
  const cargarNotificaciones = async () => {
    try {
      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("leido", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotificaciones(data || []);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

useEffect(() => {
    cargarNotificaciones();


    const canal = supabase
      .channel("notificaciones_canal")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "notificaciones" 
        },
        (payload) => {
          console.log("¡Cambio detectado en notificaciones!", payload);
          
          // Si el evento es un INSERT, procesamos la notificación
          if (payload.eventType === 'INSERT') {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
            audio.play().catch(e => console.log("Audio bloqueado:", e));
            
            setNotificaciones((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe((status) => {
        console.log(status);
      });

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // 2. Marcar como leídas (Limpia la base de datos y la visual)
  const marcarComoLeidas = async () => {
    if (notificaciones.length === 0) return;

    try {
      const { error } = await supabase
        .from("notificaciones")
        .update({ leido: true })
        .eq("leido", false);

      if (error) throw error;

      setNotificaciones([]);
    } catch (error) {
      console.error("Error al limpiar notificaciones:", error);
    }
  };

  const cerrarSesion = async () => {
    const ok = confirm("¿Cerrar sesión?");
    if (!ok) return;
    try {
      await supabase.auth.signOut();
      window.location.href = "/api/auth/signout";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      window.location.href = "/login";
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between relative">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500 capitalize">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center relative"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
              <path d="M9 17a3 3 0 0 0 6 0" />
            </svg>

            {notificaciones.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {menuAbierto && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border border-gray-100 shadow-xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                <h3 className="font-bold text-gray-800 text-sm">
                  Notificaciones
                </h3>
                {notificaciones.length > 0 && (
                  <button
                    onClick={marcarComoLeidas}
                    className="text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-700 transition"
                  >
                    Marcar todo leído
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {notificaciones.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No hay ventas nuevas por ahora.
                  </p>
                ) : (
                  notificaciones.map((noti) => (
                    <div
                      key={noti.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100/50 space-y-1"
                    >
                      <p className="text-xs text-gray-700 font-medium leading-relaxed">
                        {noti.mensaje}
                      </p>
                      {noti.meta_id && (
                        <button
                          onClick={() =>
                            (window.location.href = `/admin/ventas?highlight=${noti.meta_id}`)
                          }
                          className="text-xs font-bold text-fuchsia-600 hover:underline block pt-1"
                        >
                          Ver venta
                        </button>
                      )}
                      <span className="text-[10px] text-gray-400 block">
                        {new Date(noti.created_at).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        hs
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-2xl p-2 pr-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
            {inicial}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800">{username}</p>
            <p className="text-xs text-gray-500">Panel principal</p>
          </div>
        </div>

        <button
          onClick={cerrarSesion}
          className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-2 font-semibold text-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          <span className="hidden md:block">Salir</span>
        </button>
      </div>
    </header>
  );
}
