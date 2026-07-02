// src/components/kiosco/CatalogoListado.jsx
import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";
import PagoModal from "./PagoModal";

export default function CatalogoListado() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("catalogo_pos")
      .select(`id, precio_venta, producto_id, productos!inner (titulo, imagen_url, estado)`)
      .eq("productos.estado", "disponible")
      .order("created_at", { ascending: false });
    
    setProductos(data || []);
    setLoading(false);
  };

  const procesarVenta = async (catalogoId, productoId) => {
    await supabase.from("productos").update({ estado: 'vendido' }).eq("id", productoId);
    await supabase.from("catalogo_pos").delete().eq("id", catalogoId);
    
    setProductos(productos.filter(p => p.id !== catalogoId));
    setProductoSeleccionado(null);
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Cargando catálogo...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productos.map((p) => (
        <div key={p.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <img src={p.productos?.imagen_url} className="w-full h-48 object-cover rounded-2xl mb-4 bg-gray-50" />
          <h3 className="font-bold text-lg text-gray-800">{p.productos?.titulo}</h3>
          <p className="text-pink-600 font-bold text-2xl mt-1 mb-5">${p.precio_venta}</p>
          
          <button 
            onClick={() => setProductoSeleccionado(p)}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold cursor-pointer transition-all active:scale-95"
          >
            Vender
          </button>
        </div>
      ))}

      {productoSeleccionado && (
        <PagoModal 
          producto={productoSeleccionado} 
          onClose={() => setProductoSeleccionado(null)}
          onConfirm={() => procesarVenta(productoSeleccionado.id, productoSeleccionado.producto_id)}
        />
      )}
    </div>
  );
}