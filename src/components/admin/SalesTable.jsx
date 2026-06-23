import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";
import SaleModal from "./SaleModal";

export default function SalesTable() {
  const [ventas, setVentas] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchVentas = async () => {
    const { data } = await supabase
      .from("ventas")
      .select(`
        *,
        productos(titulo)
      `)
      .order("created_at", { ascending: false });

    setVentas(data || []);
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">

      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Ventas</h2>
          <p className="text-gray-500">
            Gestiona pedidos y ventas.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-fuchsia-500 text-white px-5 py-3 rounded-xl"
        >
          Nueva venta
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Cliente</th>
              <th>Producto</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            {ventas.map((v) => (
              <tr key={v.id} className="border-b">

                <td className="py-4">{v.cliente}</td>

                <td>{v.productos?.titulo}</td>

                <td>
                  $
                  {Number(v.total).toLocaleString("es-AR")}
                </td>

                <td>{v.estado}</td>

                <td>
                  {new Date(v.created_at)
                    .toLocaleDateString("es-AR")}
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