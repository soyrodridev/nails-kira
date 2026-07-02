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

  const procesarVenta = async (catalogoId, productoId, precio, titulo) => {
    try {
      // 1. Registro en historial de ventas
      await supabase.from("ventas").insert([{ 
        producto_id: productoId, 
        titulo, 
        precio, 
        fecha: new Date().toISOString() 
      }]);
      
      // 2. Actualizar estado del producto principal
      await supabase.from("productos").update({ estado: 'vendido' }).eq("id", productoId);
      
      // 3. Eliminar del catálogo POS
      await supabase.from("catalogo_pos").delete().eq("id", catalogoId);
      
      setProductos(productos.filter(p => p.id !== catalogoId));
      setProductoSeleccionado(null);
    } catch (err) {
      console.error(err);
      alert("Error al procesar la venta.");
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Cargando catálogo...</div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {productos.map((p) => (
          <div 
            key={p.id} 
            className="group bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all duration-300 flex flex-col"
          >
            {/* Imagen Grande */}
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100">
              <img 
                src={p.productos?.imagen_url} 
                alt={p.productos?.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-bold text-gray-800 shadow-sm">
                ${p.precio_venta}
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4 flex flex-col justify-between flex-1">
              <h3 className="font-bold text-gray-800 text-lg mb-6 leading-tight">
                {p.productos?.titulo}
              </h3>
              
              <button 
                onClick={() => setProductoSeleccionado(p)}
                className="w-full bg-gray-900 hover:bg-pink-500 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                Vender Producto
              </button>
            </div>
          </div>
        ))}

        {productos.length === 0 && (
          <div className="col-span-full p-20 text-center text-gray-400">
            No hay productos disponibles en el catálogo.
          </div>
        )}
      </div>

      {/* Modal de Pago */}
      {productoSeleccionado && (
        <PagoModal 
          producto={productoSeleccionado} 
          onClose={() => setProductoSeleccionado(null)}
          onConfirm={(metodo) => procesarVenta(
            productoSeleccionado.id, 
            productoSeleccionado.producto_id, 
            productoSeleccionado.precio_venta, 
            productoSeleccionado.productos.titulo
          )}
        />
      )}
    </>
  );
}