import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function VentasHistorial() {
  const [vendidos, setVendidos] = useState([]);

  const fetchVendidos = async () => {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .eq("estado", "vendido");
    setVendidos(data || []);
  };

  useEffect(() => {
    fetchVendidos();

    // Suscripción para que el historial también se actualice si otra terminal marca algo como vendido
    const channel = supabase
      .channel("historial_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        fetchVendidos,
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const devolverProducto = async (id) => {
    // Solo hacemos el update; el 'channel' se encarga de avisar a los demás
    await supabase
      .from("productos")
      .update({ estado: "disponible" })
      .eq("id", id);
  };
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-6">Productos Vendidos</h2>
      <div className="space-y-4">
        {vendidos.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl"
          >
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
