import { supabaseClient as supabase } from "../../lib/supabase";

export default function Topbar({
  title = "Dashboard",
  onMenuClick,
}) {
  const cerrarSesion = async () => {
    const ok = confirm("¿Cerrar sesión?");

    if (!ok) return;

    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between">

      {/* IZQUIERDA */}
      <div className="flex items-center gap-4">

        {/* BOTON MENU MOVIL */}
        <button
          onClick={onMenuClick}
          className="
            lg:hidden
            w-12
            h-12
            rounded-2xl
            bg-gray-100
            hover:bg-gray-200
            transition
            flex
            items-center
            justify-center
          "
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
          <h1 className="text-2xl font-bold text-gray-800">
            {title}
          </h1>

          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

      </div>

      {/* DERECHA */}
      <div className="flex items-center gap-4">

        {/* Notificaciones */}
        <button className="relative w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center">

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

          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Usuario */}
        <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-2xl p-2 pr-4">

          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-bold">
            A
          </div>

          <div>
            <p className="font-semibold text-sm">
              Administrador
            </p>

            <p className="text-xs text-gray-500">
              Panel principal
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={cerrarSesion}
          className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-2"
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

          <span className="hidden md:block">
            Salir
          </span>
        </button>

      </div>
    </header>
  );
}