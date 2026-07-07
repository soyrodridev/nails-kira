import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";
import PagoModal from "./PagoModal";

export default function CatalogoListado() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

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

  useEffect(() => {
    fetchProductos();

    const channel = supabase
      .channel('catalogo_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, fetchProductos)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catalogo_pos' }, fetchProductos)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const procesarVenta = async (catalogoId, productoId, precio, titulo) => {
    try {
      const objetoVenta = { 
        producto_id: productoId,
        cliente: "Cliente Mostrador",
        cantidad: 1,
        total: Number(precio),
        ganancia: 0,
        estado: 'Entregado',
        estado_pago: 'aprobado'
      };

      const { error: ventaError } = await supabase.from("ventas").insert([objetoVenta]);
      if (ventaError) throw new Error(ventaError.message);
      
      const { error: prodError } = await supabase.from("productos").update({ estado: 'vendido' }).eq("id", productoId);
      if (prodError) throw new Error(prodError.message);
      
      const { error: catError } = await supabase.from("catalogo_pos").delete().eq("id", catalogoId);
      if (catError) throw new Error(catError.message);
      
      setProductoSeleccionado(null);
    } catch (err) {
      console.error(err);
      alert("Error al procesar: " + err.message);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Cargando catálogo...</div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:border-pink-200 transition-all">
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100">
              <img src={p.productos?.imagen_url} alt={p.productos?.titulo} className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded-full font-bold shadow-sm">
                ${p.precio_venta}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-4">{p.productos?.titulo}</h3>
              <button 
                onClick={() => setProductoSeleccionado(p)}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-pink-500 transition-all active:scale-95"
              >
                Vender Producto
              </button>
            </div>
          </div>
        ))}
      </div>

      {productoSeleccionado && (
        <PagoModal 
          producto={productoSeleccionado} 
          onClose={() => setProductoSeleccionado(null)}
          onConfirm={() => procesarVenta(
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