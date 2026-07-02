import { useState, useEffect } from "react";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {

  const links = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 13h8V3H3v10zM13 21h8V3h-8v18zM3 21h8v-6H3v6z" />
        </svg>
      ),
    },

    {
      name: "Productos",
      href: "/admin/productos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 7L12 3 4 7l8 4 8-4z" />
          <path d="M4 7v10l8 4 8-4V7" />
        </svg>
      ),
    },

    {
      name: "Ventas",
      href: "/admin/ventas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16v12H4z" />
          <path d="M8 10h8" />
        </svg>
      ),
    },
    {
      name: "Catalogos",
      href: "/admin/catalogos",
      icon: (
        <svg  className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-menu-3">
	<path stroke="none" d="M0 0h24v24H0z" fill="none" />
	<path d="M10 6h10" />
	<path d="M4 12h16" />
	<path d="M7 12h13" />
	<path d="M4 18h10" />
</svg>
      ),
    },

    {
      name: "Finanzas",
      href: "/admin/finanzas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 17l6-6 4 4 8-8" />
        </svg>
      ),
    },

    {
      name: "Configuración",
      href: "/admin/configuracion",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8A1.6 1.6 0 0 0 3 13.5H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.7 8a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 3.7h.2A1.6 1.6 0 0 0 10 2.2V2a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 .8 1.5h.2a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.2a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z" />
        </svg>
      ),
    },
  ];

  const [pathname, setPathname] = useState("");

useEffect(() => {
  setPathname(window.location.pathname);
}, []);

  return (
    <>
      

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0 z-50
          h-screen w-80
          bg-white/90
          backdrop-blur-2xl
          border-r border-gray-100
          flex flex-col
          transition-transform duration-300
          shadow-2xl lg:shadow-none

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex justify-between items-center">

            <div className="flex items-center gap-4">

              

              <div>
                <img src="/logo-nail.svg" alt="Logo Nail" className="w-full"/>

                <p className="text-sm text-gray-500 text-right">
                  Admin Dashboard
                </p>
              </div>

            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="
                lg:hidden
                w-10
                h-10
                rounded-xl
                hover:bg-gray-100
                text-xl
              "
            >
              ✕
            </button>

          </div>
        </div>

        {/* MENÚ */}
        <nav className="flex-1 p-5 space-y-3 overflow-y-auto">

          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`
                flex items-center gap-4
                px-5 py-4 rounded-2xl
                font-medium
                transition-all duration-300

                ${
                  pathname === link.href
                    ? `
                      bg-gradient-to-r
                      from-fuchsia-500
                      to-pink-500
                      text-white
                      shadow-lg
                      scale-[1.02]
                    `
                    : `
                      text-gray-600
                      hover:bg-fuchsia-50
                      hover:text-fuchsia-600
                    `
                }
              `}
            >
              {link.icon}
              {link.name}
            </a>
          ))}

        </nav>

        {/* FOOTER */}
        <div className="p-5 border-t border-gray-100">

          <div className="
            rounded-3xl
            bg-gradient-to-r
            from-fuchsia-500
            to-pink-500
            p-6
            text-white
            shadow-xl
          ">
            <h3 className="font-semibold text-lg">
              💖 Tu negocio crece
            </h3>

            <p className="text-sm opacity-90 mt-2 leading-relaxed">
              Sigue registrando ventas y controla todas tus ganancias.
            </p>
          </div>

        </div>
      </aside>
    </>
  );
}