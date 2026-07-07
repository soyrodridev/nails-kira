import { useState, useEffect } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function ControlSesion() {
  const [sesionActiva, setSesionActiva] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetchSesionActiva();
  }, []);

  const fetchSesionActiva = async () => {
    setCargando(true);
    const { data } = await supabase
      .from("sesiones")
      .select("*")
      .eq("estado", "activa")
      .single();
    
    setSesionActiva(data); // Si no hay nada, data es null
    setCargando(false);
  };

  const manejarCiclo = async () => {
    if (sesionActiva) {
      // SI HAY SESIÓN: Finalizar
      if (!confirm("¿Cerrar sesión actual e iniciar un nuevo ciclo de ventas?")) return;
      await supabase.from("sesiones").update({ estado: 'cerrada' }).eq("id", sesionActiva.id);
    }

    // CREAR NUEVA SESIÓN (Se ejecuta siempre al hacer click)
    const { error } = await supabase.from("sesiones").insert([{ 
      nombre: `Ciclo ${new Date().toLocaleDateString()}`, 
      estado: 'activa' 
    }]);

    if (!error) {
      alert("Ciclo actualizado correctamente");
      window.location.reload();
    }
  };

  if (cargando) return <div className="p-6 bg-gray-50 rounded-3xl animate-pulse">Cargando control...</div>;

  return (
    <div className={`p-6 rounded-3xl text-white mb-8 shadow-lg ${sesionActiva ? 'bg-gradient-to-r from-pink-500 to-rose-600' : 'bg-gray-400'}`}>
      <h3 className="text-lg font-bold opacity-90">
        {sesionActiva ? "Ciclo de Venta Actual" : "No hay ciclo activo"}
      </h3>
      <p className="text-3xl font-extrabold mb-4">
        {sesionActiva ? sesionActiva.nombre : "El sistema está detenido"}
      </p>
      
      <button 
        onClick={manejarCiclo}
        className="bg-white text-pink-600 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-md"
      >
        {sesionActiva ? "Finalizar Ciclo y Abrir Nuevo" : "Iniciar Primer Ciclo"}
      </button>
    </div>
  );
}