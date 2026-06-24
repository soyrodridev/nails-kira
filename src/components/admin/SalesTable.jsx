import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";
import SaleModal from "./SaleModal";

export default function SalesTable() {
  const [ventas, setVentas] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchVentas = async () => {
    const { data } = await supabase
      .from("ventas")
      .select(`*, productos(titulo)`)
      .order("created_at", { ascending: false });

    setVentas(data || []);
  };

  const eliminarVenta = async (venta) => {
    if (!confirm("¿Estás seguro de anular esta venta? Esto borrará el registro y el movimiento financiero.")) return;

    try {
      // 1. Borrar la venta
      await supabase.from("ventas").delete().eq("id", venta.id);
      
      // 2. Borrar el movimiento financiero asociado usando el ID de la venta
      await supabase.from("movimientos").delete().eq("venta_id", venta.id);
      
      fetchVentas(); 
    } catch (error) {
      console.error("Error al anular:", error);
      alert("No se pudo anular la venta");
    }
  };

  useEffect(() => {
    fetchVentas();
    
    // Lógica para resaltar si viene un ID por URL
    const params = new URLSearchParams(window.location.search);
    const highlightId = params.get('highlight');
    if (highlightId) {
      setTimeout(() => {
        const el = document.getElementById(highlightId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-fuchsia-100');
        }
      }, 500);
    }
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Ventas Recientes</h2>
          <p className="text-sm text-gray-500">Historial de transacciones.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2.5 rounded-2xl font-medium text-sm transition"
        >
          + Nueva venta
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50">
            <tr className="text-gray-500">
              <th className="text-left px-6 py-4 font-medium">Cliente</th>
              <th className="text-left px-6 py-4 font-medium">Producto</th>
              <th className="text-left px-6 py-4 font-medium">Total</th>
              <th className="text-left px-6 py-4 font-medium">Estado</th>
              <th className="text-right px-6 py-4 font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {ventas.map((v) => (
              <tr id={v.id} key={v.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{v.cliente || "Sin nombre"}</td>
                <td className="px-6 py-4 text-gray-600">{v.productos?.titulo}</td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  ${Number(v.total).toLocaleString("es-AR")}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase">
                    {v.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => eliminarVenta(v)}
                    className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-xl"
                    title="Anular venta"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <SaleModal
          onClose={() => {
            setOpen(false);
            fetchVentas();
          }}
        />
      )}
    </div>
  );
}