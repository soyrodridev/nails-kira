import { useState, useEffect } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function CatalogoForm({ onSuccess }) {
  const [modo, setModo] = useState("nuevo");
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInventario = async () => {
      const { data } = await supabase.from("productos").select("id, titulo");
      setInventario(data || []);
    };
    fetchInventario();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    try {
      // 1. Obtener sesión activa para vincular el producto
      const { data: sesion } = await supabase
        .from("sesiones")
        .select("id")
        .eq("estado", "activa")
        .single();
        
      if (!sesion) throw new Error("No hay una sesión activa para cargar productos.");

      let finalProductoId = formData.get("producto_id");

      // LÓGICA SI ES UN PRODUCTO NUEVO
      if (modo === "nuevo") {
        const file = formData.get("imagen");
        const fileName = `${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from("productos")
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("productos")
          .getPublicUrl(fileName);

        const { data: nuevoP, error: insertError } = await supabase
          .from("productos")
          .insert({ 
            titulo: formData.get("titulo"), 
            imagen_url: publicUrl 
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        finalProductoId = nuevoP.id;
      }

      // INSERTAR EN CATÁLOGO POS CON SESIÓN
      const { error: posError } = await supabase.from("catalogo_pos").insert({
        producto_id: finalProductoId,
        precio_venta: formData.get("precio_venta"),
        sesion_id: sesion.id
      });

      if (posError) throw posError;

      onSuccess();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none transition-all";

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Agregar producto al Kiosco</h2>
      
      <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 mb-8">
        <button 
          type="button"
          onClick={() => setModo("nuevo")} 
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${modo === 'nuevo' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}
        >
          Crear Nuevo
        </button>
        <button 
          type="button"
          onClick={() => setModo("existente")} 
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${modo === 'existente' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}
        >
          Del Inventario
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {modo === "nuevo" ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            <input name="titulo" placeholder="Nombre del producto" className={inputClass} required />
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-pink-300 transition-colors">
              <input name="imagen" type="file" className="text-sm text-gray-500" required />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <select name="producto_id" className={inputClass} required>
              <option value="">Selecciona un producto...</option>
              {inventario.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </select>
          </div>
        )}
        
        <input name="precio_venta" type="number" placeholder="Precio de venta en Kiosco ($)" className={inputClass} required />
        
        <button 
          disabled={loading} 
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Publicar en Catálogo"}
        </button>
      </form>
    </div>
  );
}