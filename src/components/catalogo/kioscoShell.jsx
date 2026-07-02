import { useState, useEffect } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";
import CatalogoListado from "./CatalogoListado";
import VentasHistorial from "./VentasHistorial";

export default function KioscoShell({ username }) {
  const [vista, setVista] = useState("catalogo");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [perfilMenu, setPerfilMenu] = useState(false);
  const [stats, setStats] = useState({ stock: 0, ventas: 0 });

  useEffect(() => {
    async function fetchStats() {
      const { count: stockCount } = await supabase.from("catalogo_pos").select("*", { count: "exact", head: true });
      const { count: ventasCount } = await supabase.from("ventas").select("*", { count: "exact", head: true });
      setStats({ stock: stockCount || 0, ventas: ventasCount || 0 });
    }
    fetchStats();
  }, [vista]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-6 transition-transform md:translate-x-0 ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <img src="/logo-nail.svg" alt="Nails Kira" className="w-32 mb-10" />
        <nav className="space-y-2">
          <button onClick={() => { setVista("catalogo"); setMenuAbierto(false); }} className={`w-full text-left px-4 py-3 rounded-lg font-medium ${vista === 'catalogo' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Catálogo POS</button>
          <button onClick={() => { setVista("ventas"); setMenuAbierto(false); }} className={`w-full text-left px-4 py-3 rounded-lg font-medium ${vista === 'ventas' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Ventas</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 md:ml-64">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuAbierto(!menuAbierto)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>

          {/* PERFIL */}
          <div className="relative">
            <button 
              onClick={() => setPerfilMenu(!perfilMenu)}
              className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50"
            >
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                {username?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-700">{username}</span>
            </button>

            {perfilMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium">
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Productos</p>
            <p className="text-3xl font-bold">{stats.stock}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Ventas</p>
            <p className="text-3xl font-bold">{stats.ventas}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {vista === "catalogo" ? <CatalogoListado /> : <VentasHistorial />}
        </div>
      </main>
    </div>
  );
}