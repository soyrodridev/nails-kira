import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function CatalogList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    
    // Obtener la sesión activa para filtrar
    const { data: sesion } = await supabase
      .from("sesiones")
      .select("id")
      .eq("estado", "activa")
      .single();

    if (sesion) {
      const { data } = await supabase
        .from("catalogo_pos")
        .select(`id, precio_venta, created_at, productos (titulo, imagen_url)`)
        .eq("sesion_id", sesion.id)
        .order("created_at", { ascending: false });
      
      setItems(data || []);
    }
    setLoading(false);
  };

  const eliminarDelCatalogo = async (id) => {
    if (!confirm("¿Eliminar este producto del catálogo?")) return;
    await supabase.from("catalogo_pos").delete().eq("id", id);
    loadItems();
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Productos en Catálogo</h2>
        <p className="text-sm text-gray-400">Gestión de inventario para el POS</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-50">
              <th className="pb-4 font-semibold">Producto</th>
              <th className="pb-4 font-semibold hidden md:table-cell">Precio</th>
              <th className="pb-4 font-semibold hidden md:table-cell">Fecha</th>
              <th className="pb-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 flex items-center gap-4">
                  <img 
                    src={item.productos?.imagen_url} 
                    alt={item.productos?.titulo} 
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                  />
                  <div>
                    <p className="font-bold text-gray-800">{item.productos?.titulo}</p>
                    <p className="text-[10px] text-gray-400 font-mono">ID #{item.id.slice(0, 8)}...</p>
                    <div className="md:hidden mt-1 text-xs">
                      <span className="text-pink-500 font-bold">${item.precio_venta}</span>
                      <span className="text-gray-400 ml-2">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 font-bold text-gray-700 hidden md:table-cell">${item.precio_venta}</td>
                <td className="py-4 text-gray-500 text-sm hidden md:table-cell">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 text-right">
                  <button 
                    onClick={() => eliminarDelCatalogo(item.id)}
                    className="text-red-500 cursor-pointer hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {items.length === 0 && (
        <div className="py-12 text-center text-gray-400 italic">
          No hay productos agregados al catálogo.
        </div>
      )}
    </div>
  );
}