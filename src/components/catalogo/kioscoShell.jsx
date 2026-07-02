import { useState } from "react";
import CatalogoListado from "./CatalogoListado"; // Componente con los productos
import VentasHistorial from "./VentasHistorial"; // Componente con la tabla de ventas

export default function KioscoShell({ username }) {
  // Estado para controlar qué sección mostrar
  const [vista, setVista] = useState("catalogo");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR - Fijo */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between h-screen sticky top-0">
        <div>
          <img src="/logo-nail.svg" alt="Nails Kira"  className="w-40 py-2" />
          <nav className="space-y-2">
            <button 
              onClick={() => setVista("catalogo")}
              className={`w-full cursor-pointer text-left px-4 py-3 rounded-2xl font-bold ${vista === 'catalogo' ? 'bg-pink-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Catálogo POS
            </button>
            <button 
              onClick={() => setVista("ventas")}
              className={`w-full cursor-pointer text-left px-4 py-3 rounded-2xl font-medium ${vista === 'ventas' ? 'bg-pink-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Ventas
            </button>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">Hola, {username}</h2>
        </header>

        {/* RENDERIZADO CONDICIONAL DE "HIJOS" */}
        <div className="animate-in fade-in duration-300">
          {vista === "catalogo" && <CatalogoListado />}
          {vista === "ventas" && <VentasHistorial />}
        </div>
      </main>
    </div>
  );
}