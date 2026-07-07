import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function PagoModal({ producto, onClose, onConfirm }) {
  const [metodo, setMetodo] = useState(null);
  const [urlPago, setUrlPago] = useState(null);
  const [loading, setLoading] = useState(false); // Loader unificado
  const [pagoRealizado, setPagoRealizado] = useState(false);
  const [consultandoPago, setConsultandoPago] = useState(false);

  // Función para cerrar, ejecutar callback y recargar
  const finalizarOperacion = () => {
    onConfirm(); // Ejecuta la venta en el componente padre
    window.location.reload(); // Recarga la página para refrescar todos los datos
  };

  const generarQrReal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crear-pago-pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalogoId: producto.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!data.url) throw new Error("La API no devolvió una URL válida");
      setUrlPago(data.url);
      setConsultandoPago(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
      setLoading(false);
    }
  };

  const confirmarVentaEfectivo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/productos/ventas-mostrador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalogoId: producto.id, metodo: "efectivo" }),
      });
      if (!res.ok) throw new Error("Error al guardar venta");
      
      setPagoRealizado(true);
      setTimeout(finalizarOperacion, 2000); // Espera 2s para mostrar el éxito y recarga
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  /* Monitoreo del pago QR */
  useEffect(() => {
    if (!consultandoPago) return;
    const intervalo = setInterval(async () => {
      try {
        const res = await fetch(`/api/pago-status?id=${producto.id}`);
        const data = await res.json();
        if (data.pagado) {
          clearInterval(intervalo);
          setPagoRealizado(true);
          setConsultandoPago(false);
          setTimeout(finalizarOperacion, 2000);
        }
      } catch (err) { console.error(err); }
    }, 2000);
    return () => clearInterval(intervalo);
  }, [consultandoPago]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-[32px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
          {pagoRealizado ? "¡Venta Registrada!" : "Cobrar Venta"}
        </h2>
        
        {!pagoRealizado && (
          <p className="text-gray-500 text-center text-lg mb-8">{producto.productos.titulo}</p>
        )}

        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 mb-8 flex flex-col items-center justify-center min-h-[340px]">
          {pagoRealizado ? (
            <div className="flex flex-col items-center animate-in fade-in">
              <div className="w-40 h-40 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                <svg className="w-24 h-24 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h2 className="mt-8 text-3xl font-extrabold text-green-600">¡Éxito!</h2>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin w-16 h-16 text-pink-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25"/><path d="M22 12A10 10 0 0012 2" stroke="currentColor" strokeWidth="3"/></svg>
              <p className="mt-8 font-bold text-pink-600">Procesando...</p>
            </div>
          ) : !metodo ? (
            <div className="grid grid-cols-2 gap-6 w-full">
              <button onClick={confirmarVentaEfectivo} className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-green-400">
                <svg className="w-24 h-24 mb-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="font-bold text-lg text-gray-800">Efectivo</span>
              </button>
              <button onClick={() => { setMetodo("qr"); generarQrReal(); }} className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-400">
                <svg className="w-24 h-24 mb-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h6v6H3V3zM3 15h6v6H3v-6zM15 3h6v6h-6V3zM15 15h2v2h-2v-2zM19 19h2v2h-2v-2zM15 19h2v2h-2v-2zM19 15h2v2h-2v-2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="font-bold text-lg text-gray-800">Mercado Pago</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
                <QRCodeSVG value={urlPago || ""} size={240} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-800">Escaneá para pagar</h3>
            </div>
          )}
        </div>

        {!pagoRealizado && !loading && (
          <button onClick={onClose} className="w-full text-gray-500 font-bold py-3 hover:text-gray-800 transition">
            {metodo ? "← Volver atrás" : "Cancelar operación"}
          </button>
        )}
      </div>
    </div>
  );
}