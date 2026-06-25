// src/components/client/PerfilForm.jsx
import React, { useState } from 'react';
import { supabaseClient as supabase } from "../../lib/supabase";

export default function PerfilForm({ user }) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const nombre = formData.get("nombre");

const { error } = await supabase
  .from("perfiles")
  .update({ nombre })
      .eq("id", user.id);

    if (error) {
      setMensaje("Error al actualizar: " + error.message);
    } else {
      setMensaje("¡Perfil actualizado con éxito!");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Mi Perfil</h2>
      
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
          <input 
            type="text" 
            name="nombre" 
            defaultValue={user.nombre} 
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
          <input 
            type="email" 
            disabled 
            value={user.email} 
            className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Numero de telefono</label>
          <input 
            type="text" 
            disabled 
            value={user.telefono} 
            className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl transition-all"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>

        {mensaje && (
          <p className={`text-sm text-center ${mensaje.includes("Error") ? "text-red-500" : "text-green-500"}`}>
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}