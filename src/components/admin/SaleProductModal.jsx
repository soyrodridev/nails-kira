import { useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function SaleProductModal({
  producto,
  onClose,
}) {

  const [cliente, setCliente] = useState("");
  const [precio, setPrecio] = useState(producto.precio);
  const [pago, setPago] = useState("Efectivo");

  const vender = async () => {

    // guardar venta
    await supabase.from("ventas").insert([{
      cliente,
      producto_id: producto.id,
      total: precio,
      estado: "Entregado"
    }]);

    // guardar movimiento financiero
    await supabase.from("movimientos").insert([{
      tipo: "ingreso",
      concepto: `Venta: ${producto.titulo}`,
      categoria: "Ventas",
      monto: precio,
      descripcion: `Pago: ${pago}`
    }]);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">

      <div className="bg-white p-8 rounded-3xl w-full max-w-lg">

        <h2 className="text-2xl font-bold mb-6">
          Registrar venta
        </h2>

        <div className="space-y-4">

          <div className="bg-fuchsia-50 p-4 rounded-2xl">
            <p className="font-semibold">
              {producto.titulo}
            </p>
          </div>

          <input
            placeholder="Cliente (opcional)"
            value={cliente}
            onChange={(e)=>setCliente(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="number"
            value={precio}
            onChange={(e)=>setPrecio(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />

          <select
            value={pago}
            onChange={(e)=>setPago(e.target.value)}
            className="w-full p-3 border rounded-xl"
          >
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Mercado Pago</option>
          </select>

          <div className="flex gap-3">

            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 py-3 rounded-xl"
            >
              Cancelar
            </button>

            <button
              onClick={vender}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl"
            >
              Confirmar venta
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}