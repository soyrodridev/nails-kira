import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function VentasHistorial() {
  const [vendidos, setVendidos] = useState([]);
  const [isDevolviendo, setIsDevolviendo] = useState(false);
  const [ventaASeleccionar, setVentaASeleccionar] = useState(null);
  const [sesionActiva, setSesionActiva] = useState(null);
  const [totales, setTotales] = useState({ efectivo: 0, qr: 0, total: 0 });

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    const { data: sesion } = await supabase
      .from("sesiones")
      .select("id")
      .eq("estado", "activa")
      .single();

    if (!sesion) return;
    setSesionActiva(sesion);

    const { data, error } = await supabase
      .from("ventas")
      .select(`
        id, total, created_at, 
        productos (id, titulo, precio),
        pagos_pos (tipo)
      `)
      .eq("sesion_id", sesion.id)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error al traer ventas:", error);
    } else {
      setVendidos(data || []);
      
      const resumen = data.reduce((acc, v) => {
        const metodo = v.pagos_pos?.[0]?.tipo?.toLowerCase() === 'qr' ? 'qr' : 'efectivo';
        acc[metodo] = (acc[metodo] || 0) + (v.total || 0);
        acc.total += (v.total || 0);
        return acc;
      }, { efectivo: 0, qr: 0, total: 0 });
      
      setTotales(resumen);
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "Fecha no disponible";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-AR", { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const ejecutarDevolucion = async () => {
    if (!ventaASeleccionar || !sesionActiva) return;
    
    setIsDevolviendo(true);
    const producto = ventaASeleccionar.productos;

    try {
      // 1. Reingresar al catálogo
      const { data: existente } = await supabase
        .from("catalogo_pos")
        .select("id")
        .eq("producto_id", producto.id)
        .eq("sesion_id", sesionActiva.id)
        .maybeSingle();

      if (existente) {
        await supabase.from("catalogo_pos").update({ created_at: new Date().toISOString() }).eq("id", existente.id);
      } else {
        await supabase.from("catalogo_pos").insert([{
          producto_id: producto.id,
          precio_venta: producto.precio,
          sesion_id: sesionActiva.id,
          created_at: new Date().toISOString()
        }]);
      }

      // 2. Registrar movimiento negativo en finanzas (ajuste por devolución)
      await supabase.from("movimientos").insert([{
        tipo: 'egreso',
        concepto: `Devolución: ${producto.titulo}`,
        categoria: 'Ajuste Ventas',
        monto: ventaASeleccionar.total,
        created_at: new Date().toISOString()
      }]);

      // 3. Actualizar producto y borrar venta
      await supabase.from("productos").update({ estado: 'disponible' }).eq("id", producto.id);
      await supabase.from("ventas").delete().eq("id", ventaASeleccionar.id);

      // Actualizar vista local
      setVendidos(vendidos.filter(v => v.id !== ventaASeleccionar.id));
      alert("Producto devuelto y registrado en movimientos.");
      window.location.reload(); // Recargamos para refrescar totales
    } catch (err) {
      console.error("Error:", err);
      alert("Error al devolver: " + err.message);
    } finally {
      setIsDevolviendo(false);
      setVentaASeleccionar(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Cierre de Caja - Sesión Activa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl">
            <p className="text-xs text-blue-600 font-bold uppercase">Efectivo</p>
            <p className="text-2xl font-black text-blue-900">${totales.efectivo}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-2xl">
            <p className="text-xs text-purple-600 font-bold uppercase">QR / Digital</p>
            <p className="text-2xl font-black text-purple-900">${totales.qr}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-2xl">
            <p className="text-xs text-green-700 font-bold uppercase">Total Acumulado</p>
            <p className="text-2xl font-black text-green-900">${totales.total}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {vendidos.map((v) => (
          <div key={v.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-bold">{v.productos?.titulo || "Producto eliminado"}</p>
              <div className="flex gap-2 items-center mt-1">
                <span className="text-sm text-gray-600 font-bold">${v.total}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  v.pagos_pos?.[0]?.tipo === 'QR' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {v.pagos_pos?.[0]?.tipo || 'Efectivo'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{formatearFecha(v.created_at)}</p>
            </div>
            <button 
              disabled={isDevolviendo}
              onClick={() => setVentaASeleccionar(v)}
              className="text-pink-500 text-sm font-bold bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100 transition"
            >
              Devolver
            </button>
          </div>
        ))}
      </div>

      {ventaASeleccionar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2">¿Confirmar devolución?</h3>
            <p className="text-gray-500 mb-8">Se ajustará el balance en finanzas.</p>
            <div className="flex gap-3">
              <button onClick={() => setVentaASeleccionar(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancelar</button>
              <button onClick={ejecutarDevolucion} className="flex-1 py-3 bg-pink-600 text-white rounded-xl font-bold">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}