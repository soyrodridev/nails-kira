import { useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function SaleProductModal({ producto, onClose }) {
  const [cliente, setCliente] = useState("");
  const [precio, setPrecio] = useState(producto.precio);
  const [pago, setPago] = useState("Efectivo");
  const [cargando, setCargando] = useState(false);

  const vender = async () => {
    setCargando(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const { data: venta, error: ventaError } = await supabase
        .from("ventas")
        .insert([{
          cliente: cliente || "Anónimo",
          producto_id: producto.id,
          total: Number(precio),
          estado: "Entregado",
        }])
        .select("id")
        .single();

      if (ventaError) throw ventaError;

      // 2. Guardar movimiento financiero
      await supabase.from("movimientos").insert([{
        tipo: "ingreso",
        concepto: `Venta: ${producto.titulo}`,
        categoria: "Ventas",
        monto: Number(precio),
        descripcion: `Pago: ${pago}`,
      }]);

      // 3. Insertar la notificación (Sin forzar kiosco_id para evitar RLS violado)
      const { error: notiError } = await supabase
        .from("notificaciones")
        .insert([{
          mensaje: `Nueva venta: ${producto.titulo} - $${precio} (${pago})`,
          leido: false,
          meta_id: venta.id.toString()
        }]);

      if (notiError) throw notiError;

      onClose();
    } catch (error) {
      console.error("Error al registrar:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Registrar venta</h2>
        <div className="space-y-4">
          <div className="bg-fuchsia-50 p-4 rounded-2xl">
            <p className="font-semibold">{producto.titulo}</p>
          </div>
          <input
            placeholder="Cliente (opcional)"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
          <select
            value={pago}
            onChange={(e) => setPago(e.target.value)}
            className="w-full p-3 border rounded-xl"
          >
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Mercado Pago</option>
          </select>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={cargando}
              className="flex-1 bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              onClick={vender}
              disabled={cargando}
              className={`flex-1 text-white py-3 rounded-xl transition ${cargando ? "bg-green-400" : "bg-green-600 hover:bg-green-700"}`}
            >
              {cargando ? "Registrando..." : "Confirmar venta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}