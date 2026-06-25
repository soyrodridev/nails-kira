// src/components/client/PedidosList.jsx
import React, { useEffect, useState } from 'react';
import { supabaseClient as supabase } from "../../lib/supabase";

export default function PedidosList() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setCargando(true);
      const res = await fetch("/api/orders/my-orders");
      if (!res.ok) throw new Error("Error al obtener pedidos");
      const data = await res.json();
      setPedidos(data || []);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-pink-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Mis Pedidos</h2>
      
      {pedidos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">Aún no realizaste ningún pedido.</p>
          <a href="/" className="text-pink-500 font-bold mt-2 block hover:underline">Ir a comprar</a>
        </div>
      ) : (
        <div className="grid gap-6">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="group bg-white rounded-3xl p-6 shadow-lg border border-gray-100 transition-all hover:shadow-xl hover:border-pink-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">Pedido #{pedido.order_code}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Realizado el {new Date(pedido.created_at).toLocaleDateString('es-AR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
                    pedido.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    pedido.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                    'bg-pink-100 text-pink-700'
                  }`}>
                    {pedido.status === 'pending' ? 'Pendiente' : pedido.status}
                  </span>
                  <span className="text-2xl font-black text-pink-600">
                    ${pedido.total.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
              
              {/* Línea decorativa */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
                <button className="text-sm font-semibold text-gray-400 hover:text-pink-500 transition-colors">
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}