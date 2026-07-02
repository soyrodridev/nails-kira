import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function VentasHistorial() {
  const [vendidos, setVendidos] = useState([]);

  useEffect(() => {
    fetchVendidos();
  }, []);

  const fetchVendidos = async () => {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .eq("estado", "vendido");
    setVendidos(data || []);
  };

  const devolverProducto = async (id) => {
    const { error } = await supabase
      .from("productos")
      .update({ estado: 'disponible' })
      .eq("id", id);
      
    if (!error) {
      setVendidos(vendidos.filter(p => p.id !== id));
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
              onClick={() => devolverProducto(p.id)}
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