import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function VentasHistorial() {
  const [vendidos, setVendidos] = useState([]);

  useEffect(() => {
    fetchVendidos();
  }, []);

  const fetchVendidos = async () => {
    // IMPORTANTE: Verifica que 'id' sea realmente el nombre de tu columna primaria
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("estado", "vendido");
      
    if (error) {
      console.error("Error al traer vendidos:", error);
    } else {
      console.log("Productos vendidos cargados:", data);
      setVendidos(data || []);
    }
  };

  const devolverProducto = async (producto) => {
    const identificador = producto.id;

    if (!identificador) {
      alert("Error: No se pudo identificar el producto.");
      return;
    }

    try {
      // 1. RE-INSERTAR en el catálogo (esto hace que aparezca de nuevo en pantalla)
      const { error: insertError } = await supabase
        .from("catalogo_pos")
        .insert([{
          producto_id: identificador,
          precio_venta: producto.precio, // Asegúrate de que este campo exista
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      // 2. ACTUALIZAR estado a 'disponible' en la tabla de productos
      const { error: updateError } = await supabase
        .from("productos")
        .update({ estado: 'disponible' })
        .eq("id", identificador);
        
      if (updateError) throw updateError;

      // 3. ACTUALIZAR la vista local
      setVendidos(vendidos.filter(p => p.id !== identificador));
      alert("Producto devuelto al catálogo correctamente");
    } catch (err) {
      console.error("Error al devolver el producto:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-6">Productos Vendidos</h2>
      <div className="space-y-4">
        {vendidos.map((p) => (
          <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-bold">{p.titulo}</p>
              <p className="text-sm text-gray-500">Precio: ${p.precio}</p>
            </div>
            <button 
              onClick={() => devolverProducto(p)}
              className="text-pink-500 text-sm font-bold bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100"
            >
              Devolver a catálogo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}