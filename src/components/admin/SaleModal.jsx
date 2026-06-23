import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function SaleModal({ onClose }) {
  const [cliente, setCliente] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    const { data } = await supabase
      .from("productos")
      .select("*");

    setProductos(data || []);
  };

  const save = async () => {
    const producto = productos.find(
      p => p.id == productoId
    );

    if (!producto) return;

    const total = producto.precio * cantidad;

    await supabase
      .from("ventas")
      .insert([{
        cliente,
        producto_id: productoId,
        cantidad,
        total,
        estado: "Pendiente"
      }]);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">

      <div className="bg-white rounded-3xl p-8 w-full max-w-lg">

        <h2 className="text-2xl font-bold mb-6">
          Nueva venta
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Cliente"
            value={cliente}
            onChange={(e)=>setCliente(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <select
            value={productoId}
            onChange={(e)=>setProductoId(e.target.value)}
            className="w-full border p-3 rounded-xl"
          >

            <option>Seleccionar producto</option>

            {productos.map(p=>(
              <option key={p.id} value={p.id}>
                {p.titulo}
              </option>
            ))}

          </select>

          <input
            type="number"
            value={cantidad}
            onChange={(e)=>setCantidad(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <button
            onClick={save}
            className="w-full bg-fuchsia-500 text-white p-3 rounded-xl"
          >
            Guardar venta
          </button>

        </div>
      </div>
    </div>
  );
}