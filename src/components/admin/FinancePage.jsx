import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";
import MovementModal from "./MovementModal";

export default function FinancePage() {
  const [movimientos, setMovimientos] = useState([]);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const fetchMovimientos = async () => {
    const { data } = await supabase
      .from("movimientos")
      .select("*")
      .order("created_at", { ascending: false });

    setMovimientos(data || []);
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const deleteMovimiento = async (id) => {
    if (!confirm("¿Eliminar movimiento?")) return;

    await supabase.from("movimientos").delete().eq("id", id);

    fetchMovimientos();
  };

  const balance = movimientos.reduce((acc, mov) => {
    return mov.tipo === "ingreso"
      ? acc + Number(mov.monto)
      : acc - Number(mov.monto);
  }, 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Libro Diario
          </h1>

          <p className="text-gray-500">
            Control de ingresos y egresos
          </p>
        </div>

        <button
          onClick={() => {
            setEditando(null);
            setOpen(true);
          }}
          className="bg-fuchsia-600 text-white px-5 py-3 rounded-2xl"
        >
          + Nuevo movimiento
        </button>
      </div>

      {/* BALANCE */}
      <div className="bg-white rounded-3xl p-8 shadow">
        <h2 className="text-gray-500">
          Balance actual
        </h2>

        <p className={balance < 0
? "text-red-600"
: "text-green-600"}>
          {balance >= 0 ? "+" : "-"}$
          {Math.abs(balance).toLocaleString("es-AR")}
        </p>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Concepto</th>
              <th className="p-4 text-left">Categoría</th>
              <th className="p-4 text-left">Monto</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id} className="border-t">
                <td className="p-4">
                  {new Date(mov.created_at)
                    .toLocaleDateString("es-AR")}
                </td>

                <td className="p-4">
                  {mov.concepto}
                </td>

                <td className="p-4">
                  {mov.categoria}
                </td>

                <td
                  className={`p-4 font-semibold ${
                    mov.tipo === "ingreso"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {mov.tipo === "ingreso" ? "+" : "-"}$
                  {Number(mov.monto)
                    .toLocaleString("es-AR")}
                </td>

                <td className="p-4 text-right space-x-2">

                  <button
                    onClick={() => {
                      setEditando(mov);
                      setOpen(true);
                    }}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      deleteMovimiento(mov.id)
                    }
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-lg"
                  >
                    Eliminar
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {open && (
        <MovementModal
          movimiento={editando}
          onClose={() => {
            setOpen(false);
            fetchMovimientos();
          }}
        />
      )}
    </div>
  );
}