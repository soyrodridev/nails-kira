import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { supabaseClient as supabase } from "../lib/supabase";

export default function Checkout() {
  const mpFee = 0.15;
  const phoneNumber = "5493878570809";
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const { cartItems, isReady } = useContext(ShopContext);

  const [paymentMethod, setPaymentMethod] = useState("transferencia");
  const [loading, setLoading] = useState(false);
  // =========================
  // ORDER ID (estable)
  // =========================
  const [orderId] = useState(() => {
    const prefix = "PED";
    const date = new Date();

    const y = date.getFullYear().toString().slice(-2);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    const random = Math.floor(Math.random() * 900 + 100);

    return `${prefix}-${y}${m}${d}-${random}`;
  });

  // =========================
  // REDIRECT CHECK
  // =========================
  useEffect(() => {
    if (!isReady) return;

    const saved = localStorage.getItem("cart");

    if (!saved || JSON.parse(saved).length === 0) {
      window.location.href = "/";
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando checkout...
      </div>
    );
  }

  // =========================
  // TOTAL
  // =========================
  const baseTotal = cartItems.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const total =
    paymentMethod === "mercadopago"
      ? baseTotal / (1 - mpFee)
      : baseTotal;

  const formatPrice = (n) =>
    n.toLocaleString("es-AR");

  // =========================
  // WHATSAPP MESSAGE
  // =========================
  const generateWhatsAppMessage = () => {
    let message = `🛍️ *PEDIDO CONFIRMADO ${orderId}*\n\n`;

    message += `────────────────────\n\n`;
    message += `📦 *PRODUCTOS*\n`;

    cartItems.forEach((item) => {
      message += `• ${item.titulo} x${item.cantidad}\n  └ $${formatPrice(
        item.precio * item.cantidad
      )}\n`;
    });

    message += `\n────────────────────\n\n`;
    message += `💰 *TOTAL:* $${formatPrice(total)}\n`;
    message += `💳 *MÉTODO:* Transferencia bancaria\n`;

    message += `\n────────────────────\n`;
    message += `📌 Sistema automático web`;

    return encodeURIComponent(message);
  };

  // =========================
  // TRANSFERENCIA FLOW
  // =========================
  const handleTransferencia = async () => {
  setLoading(true);

  const saved = await saveOrderToDB();

  if (!saved) {
    setLoading(false);
    alert("Error guardando el pedido. Intenta nuevamente.");
    return;
  }

  const message = generateWhatsAppMessage();

  const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

  setLoading(false);
  window.open(url, "_blank");
};
  // =========================
  // MERCADO PAGO
  // =========================
  const handleMercadoPago = async () => {
  await saveOrderToDB(orderId); // 👈 IMPORTANTE

  try {
    const res = await fetch("/api/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems }),
    });

    const data = await res.json();

    if (data.init_point) {
      window.location.href = data.init_point;
    }
  } catch (err) {
    console.log("ERROR MP:", err);
  }
};

  const saveOrderToDB = async () => {
  const orderData = {
    order_code: orderId, //
    total: baseTotal,
    payment_method: paymentMethod,
    items: cartItems,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  console.log("📦 Enviando a Supabase:", orderData);

  const { data, error } = await supabase
    .from("orders")
    .insert([orderData])
    .select();

  if (error) {
    console.error("❌ SUPABASE ERROR COMPLETO:", error);
    console.error("❌ MESSAGE:", error.message);
    console.error("❌ DETAILS:", error.details);
    console.error("❌ HINT:", error.hint);

    return false;
  }

  console.log("✅ GUARDADO OK:", data);
  return true;
};
const LoaderBar = () => (
  <div className="w-full h-1 bg-pink-200 rounded-full overflow-hidden mt-2">
    <div className="h-full w-1/2 bg-pink-500 animate-pulse rounded-full" />
  </div>
);
  // =========================
  // UI
  // =========================
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">

      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-10">

        {/* ===================== PRODUCTS ===================== */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Tu pedido</h2>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-4"
              >
                <img
                  src={item.imagen_url}
                  className="w-20 h-20 object-cover rounded-2xl"
                />

                <div className="flex-1">
                  <h3 className="font-medium">{item.titulo}</h3>
                  <p className="text-sm text-gray-500">
                    Cantidad: {item.cantidad}
                  </p>
                </div>

                <p className="font-semibold text-pink-600">
                  ${formatPrice(item.precio * item.cantidad)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===================== PAYMENT ===================== */}
        <div className="bg-white rounded-3xl shadow-lg p-6 h-fit">

          <h2 className="text-2xl font-semibold mb-6">
            Método de pago
          </h2>

          <div className="space-y-4">

            {/* MP */}
           <button
  onClick={() => setPaymentMethod("mercadopago")}
  className={`w-full border-2 rounded-2xl p-5 text-left transition ${
    paymentMethod === "mercadopago"
      ? "border-pink-500 bg-pink-50 shadow-sm"
      : "border-gray-200 hover:border-pink-300"
  }`}
>
  <div className="flex justify-between items-start">
    <div>
      <p className="font-semibold">Mercado Pago</p>
      <p className="text-sm text-gray-500">
        Tarjeta, cuotas o saldo
      </p>
      <p className="text-xs text-pink-500 mt-2">
        Incluye comisión del medio de pago
      </p>
    </div>

    {paymentMethod === "mercadopago" && (
      <div className="w-3 h-3 rounded-full bg-pink-500 mt-1" />
    )}
  </div>
</button>

{/* Transferencia */}
<button
  onClick={() => setPaymentMethod("transferencia")}
  className={`w-full border-2 rounded-2xl p-5 text-left transition ${
    paymentMethod === "transferencia"
      ? "border-pink-500 bg-pink-50 shadow-sm"
      : "border-gray-200 hover:border-pink-300"
  }`}
>
  <div className="flex justify-between items-start">
    <div>
      <p className="font-semibold">Transferencia bancaria</p>
      <p className="text-sm text-gray-500">
        Pago directo sin cargos extra
      </p>
    </div>

    {paymentMethod === "transferencia" && (
      <div className="w-3 h-3 rounded-full bg-pink-500 mt-1" />
    )}
  </div>
</button>
          </div>

          {/* TOTAL */}
          <div className="flex justify-between mt-8 mb-6">
            <span>Total</span>
            <span className="text-3xl font-bold text-pink-600">
              ${formatPrice(total)}
            </span>
          </div>

          {/* BUTTON */}
          <button
  disabled={loading}
  onClick={async () => {
    setLoading(true);

    try {
      if (paymentMethod === "mercadopago") {
        await handleMercadoPago();
      } else {
        setShowWhatsappModal(true);
      }
    } finally {
      setLoading(false);
    }
  }}
  className={`w-full py-4 rounded-2xl font-medium transition flex flex-col items-center justify-center text-white ${
    loading
      ? "bg-pink-400 cursor-not-allowed"
      : "bg-pink-500 hover:bg-pink-600"
  }`}
>
  {loading ? (
    <>
      <span className="flex items-center gap-2">
        Procesando pedido...
      </span>

      <LoaderBar />
    </>
  ) : (
    "Finalizar compra"
  )}
</button>
        </div>

      </div>
      {showWhatsappModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setShowWhatsappModal(false)}
    />

    {/* MODAL */}
    <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">

      {/* HEADER */}
      <div className="bg-pink-50 px-6 py-5 border-b border-pink-100 flex items-center gap-3">

        {/* ICON */}
        <div className="w-10 h-10 rounded-2xl bg-pink-500 flex items-center justify-center text-white shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-6h2v6zm0-8h-2V6h2v2z" />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Confirmar pedido
          </h2>
          <p className="text-xs text-gray-500">
            Continuar en WhatsApp
          </p>
        </div>

      </div>

      {/* CONTENT */}
      <div className="p-6">

        <p className="text-gray-600 text-sm leading-relaxed">
          Para finalizar tu compra serás redirigido a WhatsApp.
          Allí recibirás el detalle completo de tu pedido para confirmarlo.
        </p>

        {/* INFO BOX */}
        <div className="mt-5 bg-pink-50 border border-pink-100 rounded-2xl p-4 flex gap-3">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-pink-500 mt-0.5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm1 17h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>

          <p className="text-xs text-gray-600 leading-relaxed">
            Revisá que los productos y cantidades sean correctos antes de continuar.
          </p>

        </div>

        {/* BUTTONS */}
        <div className="mt-6 flex gap-3 justify-end">

          <button
            onClick={() => setShowWhatsappModal(false)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>

          <button
            onClick={async () => {
  setShowWhatsappModal(false);
  await handleTransferencia();
}}
            className="px-5 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600 transition shadow-md flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 20l14-8L5 4v16z" />
            </svg>
            Continuar
          </button>

        </div>

      </div>

    </div>
  </div>
)}
    </section>
  );
}