import { useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function ExpenseModal({ onClose }) {

  const [concepto,setConcepto]=useState("");
  const [categoria,setCategoria]=useState("");
  const [monto,setMonto]=useState("");

  const save=async()=>{

    await supabase
      .from("gastos")
      .insert([{
        concepto,
        categoria,
        monto
      }]);

    onClose();
  }

  return(
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white rounded-3xl p-8 w-full max-w-lg">

        <h2 className="text-2xl font-bold mb-6">
          Nuevo gasto
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Concepto"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>setConcepto(e.target.value)}
          />

          <input
            placeholder="Categoría"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>setCategoria(e.target.value)}
          />

          <input
            placeholder="Monto"
            type="number"
            className="w-full border p-3 rounded-xl"
            onChange={(e)=>setMonto(e.target.value)}
          />

          <button
            onClick={save}
            className="w-full bg-red-500 text-white p-3 rounded-xl"
          >
            Guardar gasto
          </button>

        </div>
      </div>

    </div>
  )
}