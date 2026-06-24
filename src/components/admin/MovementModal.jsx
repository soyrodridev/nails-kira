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
    movimiento?.categoria || "Venta" 
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 animate-fade-in">
      
      {/* Contenedor Principal */}
      <div className="bg-[#e8e8e8] rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden flex flex-col transform transition-all">
        
        {/* Header del Modal */}
        <div className="relative p-6 border-b border-gray-300/50 flex justify-center items-center">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {movimiento ? "Editar movimiento" : "Nuevo movimiento"}
          </h2>
          
          <button 
            onClick={onClose}
            className="absolute right-6 p-1.5 rounded-full bg-gray-200/70 hover:bg-gray-300/80 text-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 md:p-8 space-y-5">

          {/* Selector de Tipo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-2xl border-0 bg-white p-4 pe-12 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </div>

          {/* Input Concepto */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Concepto
            </label>
            <input
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="¿En qué consistió el movimiento?"
              className="w-full rounded-2xl border-0 bg-white p-4 pe-12 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Selector de Categoría (Reemplaza al antiguo input) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-2xl border-0 bg-white p-4 pe-12 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="Venta">Venta</option>
              <option value="Compra">Compra</option>
              <option value="Gastos">Gastos</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          {/* Input Monto */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">
                $
              </span>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border-0 bg-white p-4 pl-8 pe-12 text-sm font-semibold text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-white/80 hover:bg-white text-gray-700 font-semibold text-sm transition active:scale-[0.98] shadow-xs"
            >
              Cancelar
            </button>

            <button
              onClick={save}
              className="flex-1 py-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-sm shadow-md shadow-fuchsia-600/20 transition active:scale-[0.98]"
            >
              Guardar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}