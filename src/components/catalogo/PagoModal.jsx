// src/components/kiosco/PagoModal.jsx
import { useState, useEffect  } from "react";
import { QRCodeSVG } from "qrcode.react";




export default function PagoModal({ producto, onClose, onConfirm }) {
  const [metodo, setMetodo] = useState(null); // null, 'efectivo', 'qr'
  const [urlPago, setUrlPago] = useState(null);
  const [pagoRealizado, setPagoRealizado] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  useEffect(() => {
  if (metodo !== "qr") return;

  const intervalo = setInterval(async () => {

    if (!producto?.id) return;

    const res = await fetch(`/api/pago-status?id=${producto.id}`);
    const data = await res.json();

    if (data.pagado) {
      setPagoRealizado(true);
      clearInterval(intervalo);

      setTimeout(() => {
        onConfirm("mercadopago");
      }, 2000);
    }

  }, 3000);

  return () => clearInterval(intervalo);

}, [metodo]);
  // Función para obtener el QR real desde tu API
  const generarQrReal = async () => {
  setLoadingQr(true);
  try {
    const res = await fetch("/api/crear-pago-pos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        catalogoId: producto.id,
        titulo: producto.productos?.titulo || "Producto",
        precio: producto.precio_venta // Asegúrate de que este sea el campo correcto de tu tabla
      }),
    });
    
    const data = await res.json();

    if (data.init_point || data.qr_data) {
      setUrlPago(data.init_point || data.qr_data);
    } else {
      alert("Error: " + (data.error || "No se pudo generar el pago"));
    }
  } catch (err) {
    console.error("Error al generar QR:", err);
    alert("Error de conexión al servidor");
  } finally {
    setLoadingQr(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-[32px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
          Cobrar Venta
        </h2>
        <p className="text-gray-500 text-center text-lg mb-8">
          {producto.productos.titulo}
        </p>

        {/* Contenedor central dinámico */}
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 mb-8 flex flex-col items-center justify-center min-h-[340px]">
          {!metodo ? (
            <div className="grid grid-cols-2 gap-6 w-full">
              <button
                onClick={() => setMetodo("efectivo")}
                className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-green-400"
              >
                <svg
                  className="w-24 h-24 mb-4 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-bold text-lg text-gray-800">
                  Efectivo
                </span>
              </button>

              <button
                onClick={() => {
                  setMetodo("qr");
                  generarQrReal();
                }}
                className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-400"
              >
                <svg
                  className="w-24 h-24 mb-4 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M3 3h6v6H3V3zM3 15h6v6H3v-6zM15 3h6v6h-6V3zM15 15h2v2h-2v-2zM19 19h2v2h-2v-2zM15 19h2v2h-2v-2zM19 15h2v2h-2v-2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-bold text-lg text-gray-800">
                  Mercado Pago
                </span>
              </button>
            </div>
          ) : metodo === "qr" ? (
            <div className="flex flex-col items-center animate-in fade-in">

  {pagoRealizado ? (
    <>
      <div className="w-40 h-40 rounded-full bg-green-100 flex items-center justify-center">

        <svg
          className="w-24 h-24 text-green-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>

      </div>

      <h3 className="mt-6 text-3xl font-bold text-green-600">
        ¡Pago realizado!
      </h3>

      <p className="text-gray-500 mt-2">
        El pago fue aprobado correctamente.
      </p>
    </>
  ) : loadingQr ? (
    <div className="text-blue-500 font-bold">
      Generando QR...
    </div>
  ) : (
    <>
      <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
        <QRCodeSVG value={urlPago} size={240} />
      </div>

      <p className="mt-6 text-blue-600 font-bold text-lg">
        Escanea para pagar
      </p>
    </>
  )}

</div>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in">
              <svg
                className="w-32 h-32 mb-4 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8l-8 8M8 8l8 8" />
              </svg>
              <p className="text-5xl font-extrabold text-green-600">
                ${producto.precio_venta}
              </p>
              <p className="mt-2 text-gray-400 font-medium">
                Confirmar cobro en efectivo
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-4">
          {metodo && (
            <button
              onClick={() => onConfirm(metodo)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-5 rounded-2xl font-bold text-lg transition-all active:scale-95"
            >
              Finalizar Venta
            </button>
          )}
          <button
            onClick={
              metodo
                ? () => {
                    setMetodo(null);
                    setUrlPago(null);
                  }
                : onClose
            }
            className="w-full text-gray-500 font-bold py-3 hover:text-gray-800 transition"
          >
            {metodo ? "← Volver atrás" : "Cancelar operación"}
          </button>
        </div>
      </div>
    </div>
  );
}
