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
    <div className="space-y-6 pb-8">
      {/* HEADER RESPONSIVE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Libro Diario
          </h1>
          <p className="text-sm text-gray-500">
            Control de ingresos y egresos
          </p>
        </div>

        <button
          onClick={() => {
            setEditando(null);
            setOpen(true);
          }}
          className="w-full sm:w-auto text-center bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium px-5 py-3 rounded-2xl shadow-sm transition active:scale-[0.98]"
        >
          + Nuevo movimiento
        </button>
      </div>

      {/* BALANCE ESTILIZADO */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Balance actual
        </h2>
        <p className={`text-3xl md:text-4xl font-extrabold mt-2 ${
          balance < 0 ? "text-red-600" : "text-green-600"
        }`}>
          {balance >= 0 ? "+" : "-"}$
          {Math.abs(balance).toLocaleString("es-AR")}
        </p>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* VISTA DESKTOP (Tabla tradicional oculta en móviles) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/70 border-b border-gray-100">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Concepto</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Monto</th>
                <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {movimientos.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50/40 transition">
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(mov.created_at).toLocaleDateString("es-AR")}
                  </td>

                  <td className="p-4 font-medium text-gray-800">
                    {mov.concepto}
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {mov.categoria}
                    </span>
                  </td>

                  <td className={`p-4 font-semibold text-base ${
                    mov.tipo === "ingreso" ? "text-green-600" : "text-red-600"
                  }`}>
                    {mov.tipo === "ingreso" ? "+" : "-"}$
                    {Number(mov.monto).toLocaleString("es-AR")}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditando(mov);
                        setOpen(true);
                      }}
                      className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-xl font-medium transition"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteMovimiento(mov.id)}
                      className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-xl font-medium transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VISTA MOBILE (Lista de transacciones optimizada) */}
        <div className="block md:hidden divide-y divide-gray-100">
          {movimientos.map((mov) => (
            <div key={mov.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/30 transition">
              
              {/* Línea Superior: Concepto y Monto */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800 text-base leading-tight">
                    {mov.concepto}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">
                      {new Date(mov.created_at).toLocaleDateString("es-AR")}
                    </span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md capitalize">
                      {mov.categoria}
                    </span>
                  </div>
                </div>

                <div className={`font-bold text-base whitespace-nowrap shrink-0 text-right ${
                  mov.tipo === "ingreso" ? "text-green-600" : "text-red-600"
                }`}>
                  {mov.tipo === "ingreso" ? "+" : "-"}$
                  {Number(mov.monto).toLocaleString("es-AR")}
                </div>
              </div>

              {/* Línea Inferior: Acciones adaptadas al touch */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    setEditando(mov);
                    setOpen(true);
                  }}
                  className="py-2 text-center rounded-xl text-xs font-medium bg-blue-50 text-blue-600 active:bg-blue-100/70 transition"
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteMovimiento(mov.id)}
                  className="py-2 text-center rounded-xl text-xs font-medium bg-red-50 text-red-600 active:bg-red-100/70 transition"
                >
                  Eliminar
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* ESTADO VACÍO */}
        {movimientos.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm">
            No se encontraron movimientos registrados.
          </div>
        )}

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