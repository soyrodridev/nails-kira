// src/components/client/ClientShell.jsx
import React, { useState } from 'react';

export default function ClientShell({ username, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  const navLinks = [
    { name: 'Inicio', path: '/cliente' }, // Cambiado a /cliente
    { name: 'Mis Pedidos', path: '/cliente/pedidos' },
    { name: 'Mi Perfil', path: '/cliente/perfil' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Botón hamburguesa (solo en móvil) */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md md:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
        <div className="w-6 h-0.5 bg-gray-800 mb-1"></div>
        <div className="w-6 h-0.5 bg-gray-800"></div>
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:static z-40 w-64 h-full bg-white border-r border-gray-100 p-6 flex flex-col justify-between transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="mb-10 px-2 mt-12 md:mt-0">
            <img src="/logo-nail.svg" alt="Logo" />
          </div>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className={`block px-4 py-3 rounded-2xl font-medium transition-all ${
                  currentPath === link.path
                    ? 'bg-pink-50 text-pink-600 font-bold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                {link.name}
              </a>
            ))}
            
            {/* Separador */}
            <div className="my-4 border-t border-gray-100"></div>
            
            {/* Volver a la tienda */}
            <a href="/" className="block px-4 py-3 text-pink-500 font-bold hover:bg-pink-50 rounded-2xl">
              ← Volver a la tienda
            </a>
          </nav>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <div className="mb-4 px-2">
            <p className="text-[10px] text-gray-400 uppercase">Bienvenido,</p>
            <h2 className="text-sm font-bold text-gray-700 truncate">{username}</h2>
          </div>
          <button 
            onClick={() => window.location.href = "/api/auth/signout"}
            className="w-full text-left px-2 py-2 text-xs text-gray-400 hover:text-pink-500 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      <main className="flex-1 p-4 md:p-10 w-full">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}