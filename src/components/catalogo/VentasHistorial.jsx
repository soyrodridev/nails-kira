import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function VentasHistorial() {
  const [vendidos, setVendidos] = useState([]);
  const [isDevolviendo, setIsDevolviendo] = useState(false); // Estado global de carga
  const [ventaASeleccionar, setVentaASeleccionar] = useState(null); // Venta a confirmar

  useEffect(() => {
    fetchVendidos();
  }, []);

  const fetchVendidos = async () => {
    const { data, error } = await supabase
      .from("ventas")
      .select(`id, created_at, productos (id, titulo, precio)`)
      .order("created_at", { ascending: false });
      
    if (error) console.error("Error al traer ventas:", error);
    else setVendidos(data || []);
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "Fecha no disponible";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-AR", { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const ejecutarDevolucion = async () => {
    if (!ventaASeleccionar) return;
    
    setIsDevolviendo(true);
    const producto = ventaASeleccionar.productos;

    try {
      // 1. Re-insertar en catálogo
      const { error: insertError } = await supabase
        .from("catalogo_pos")
        .insert([{
          producto_id: producto.id,
          precio_venta: producto.precio,
          created_at: new Date().toISOString()
        }]);
      if (insertError) throw insertError;

      // 2. Actualizar estado
      const { error: updateError } = await supabase
        .from("productos")
        .update({ estado: 'disponible' })
        .eq("id", producto.id);
      if (updateError) throw updateError;

      setVendidos(vendidos.filter(v => v.id !== ventaASeleccionar.id));
      alert("Producto devuelto correctamente");
    } catch (err) {
      console.error("Error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsDevolviendo(false);
      setVentaASeleccionar(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-6">Historial de Ventas</h2>
      <div className="space-y-4">
        {vendidos.map((v) => (
          <div key={v.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-bold">{v.productos?.titulo || "Producto eliminado"}</p>
              <p className="text-sm text-gray-500">Precio: ${v.productos?.precio || "0"}</p>
              <p className="text-xs font-semibold text-pink-400 mt-1">Vendió el: {formatearFecha(v.created_at)}</p>
            </div>
            <button 
              disabled={isDevolviendo}
              onClick={() => setVentaASeleccionar(v)}
              className="text-pink-500 text-sm font-bold bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100 transition disabled:opacity-50"
            >
              Devolver
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {ventaASeleccionar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2">¿Confirmar devolución?</h3>
            <p className="text-gray-500 mb-8">El producto volverá al catálogo y estará disponible para la venta.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setVentaASeleccionar(null)} 
                disabled={isDevolviendo}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarDevolucion} 
                disabled={isDevolviendo}
                className="flex-1 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 disabled:bg-pink-300"
              >
                {isDevolviendo ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}