import { useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function MovementModal({
  onClose,
  movimiento,
}) {
  const [tipo, setTipo] = useState(
    movimiento?.tipo || "ingreso"
  );

  const [concepto, setConcepto] = useState(
    movimiento?.concepto || ""
  );

  const [categoria, setCategoria] = useState(
    movimiento?.categoria || ""
  );

  const [monto, setMonto] = useState(
    movimiento?.monto || ""
  );

  const save = async () => {
    const data = {
      tipo,
      concepto,
      categoria,
      monto,
    };

    if (movimiento) {
      await supabase
        .from("movimientos")
        .update(data)
        .eq("id", movimiento.id);
    } else {
      await supabase
        .from("movimientos")
        .insert([data]);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white p-8 rounded-3xl w-full max-w-lg">

        <h2 className="text-2xl font-bold mb-6">
          {movimiento
            ? "Editar movimiento"
            : "Nuevo movimiento"}
        </h2>

        <div className="space-y-4">

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border p-3 rounded-xl"
          >
            <option value="ingreso">
              Ingreso
            </option>

            <option value="egreso">
              Egreso
            </option>
          </select>

          <input
            value={concepto}
            onChange={(e) =>
              setConcepto(e.target.value)
            }
            placeholder="Concepto"
            className="w-full border p-3 rounded-xl"
          />

          <input
            value={categoria}
            onChange={(e) =>
              setCategoria(e.target.value)
            }
            placeholder="Categoría"
            className="w-full border p-3 rounded-xl"
          />

          <input
            type="number"
            value={monto}
            onChange={(e) =>
              setMonto(e.target.value)
            }
            placeholder="Monto"
            className="w-full border p-3 rounded-xl"
          />

          <div className="flex gap-3">

            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100"
            >
              Cancelar
            </button>

            <button
              onClick={save}
              className="flex-1 py-3 rounded-xl bg-fuchsia-600 text-white"
            >
              Guardar
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}