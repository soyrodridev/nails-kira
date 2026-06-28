import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { supabaseClient as supabase } from "../lib/supabase";

export default function Checkout() {
  const mpFee = 0.15;
  const phoneNumber = "5493878570809";
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null); // Estado para el usuario
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Para esperar la verificación

  const { cartItems, isReady } = useContext(ShopContext);
  const [paymentMethod, setPaymentMethod] = useState("transferencia");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // =========================
  // ORDER ID
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

  if (!isReady || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando checkout...
      </div>
    );
  }

  // =========================
  // CÁLCULOS
  // =========================
  const baseTotal = cartItems.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );

  const total =
    paymentMethod === "mercadopago" ? baseTotal / (1 - mpFee) : baseTotal;

  const formatPrice = (n) => n.toLocaleString("es-AR");

  // =========================
  // ACCIONES
  // =========================
  const generateWhatsAppMessage = () => {
    let message = `🛍️ *PEDIDO CONFIRMADO ${orderId}*\n\n`;
    message += `────────────────────\n\n`;
    message += `📦 *PRODUCTOS*\n`;
    cartItems.forEach((item) => {
      message += `• ${item.titulo} x${item.cantidad}\n *Talle:* ${item.talleSeleccionado}\n   └ $${formatPrice(
        item.precio * item.cantidad, 
      )}\n`;
    });
    message += `\n────────────────────\n\n`;
    message += `💰 *TOTAL:* $${formatPrice(total)}\n`;
    message += `💳 *MÉTODO:* ${paymentMethod === "mercadopago" ? "Mercado Pago" : "Transferencia"}\n`;
    message += `\n────────────────────\n`;
    message += `📌 Sistema automático web`;
    return encodeURIComponent(message);
  };

  const handleTransferencia = async () => {
    setLoading(true);
    const saved = await saveOrderToDB();
    if (!saved) {
      setLoading(false);
      return;
    }
    const message = generateWhatsAppMessage();
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    setLoading(false);
    window.open(url, "_blank");
  };

  const handleMercadoPago = async () => {
    const saved = await saveOrderToDB();
    if (!saved) return;
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
      setLoading(false);
    }
  };

  const saveOrderToDB = async () => {
    if (!user) {
      setShowLoginModal(true);
      setLoading(false);
      return false;
    }

    // MEJORA DE SEGURIDAD: Solo enviamos datos básicos.
    // El precio se calcula en el servidor para evitar manipulación.
    const orderData = {
      order_code: orderId,
      payment_method: paymentMethod,
      items: cartItems.map((item) => ({
        id: item.id,
        talle: item.talleSeleccionado,
        cantidad: item.cantidad,
      })),
    };

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error guardando el pedido: " + (data.error || "Error desconocido"));
      return false;
    }

    return true;
  };

  const LoaderBar = () => (
    <div className="w-full h-1 bg-pink-200 rounded-full overflow-hidden mt-2">
      <div className="h-full w-1/2 bg-pink-500 animate-pulse rounded-full" />
    </div>
  );

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-10">
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
                  <p className="text-xs text-gray-400 mt-0.5">
      Talle: <span className="font-semibold text-pink-500">{item.talleSeleccionado}</span>
    </p>
                </div>
                <p className="font-semibold text-pink-600">
                  ${formatPrice(item.precio * item.cantidad)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 h-fit">
          <h2 className="text-2xl font-semibold mb-6">Método de pago</h2>
          <div className="space-y-4">
            <button
              onClick={() => setPaymentMethod("mercadopago")}
              className={`w-full border-2 cursor-pointer rounded-2xl p-5 text-left transition ${paymentMethod === "mercadopago" ? "border-pink-500 bg-pink-50" : "border-gray-200"}`}
            >
              <p className="font-semibold">Mercado Pago</p>
              <p className="text-xs text-pink-500 mt-2">Incluye comisión</p>
            </button>
            <button
              onClick={() => setPaymentMethod("transferencia")}
              className={`w-full border-2 rounded-2xl p-5 text-left cursor-pointer transition ${paymentMethod === "transferencia" ? "border-pink-500 bg-pink-50" : "border-gray-200"}`}
            >
              <p className="font-semibold">Transferencia bancaria</p>
              <p className="text-sm text-gray-500">Sin cargos extra</p>
            </button>
          </div>

          <div className="flex justify-between mt-8 mb-6">
            <span>Total</span>
            <span className="text-3xl font-bold text-pink-600">
              ${formatPrice(total)}
            </span>
          </div>

          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              if (paymentMethod === "mercadopago") {
                await handleMercadoPago();
              } else {
                setShowWhatsappModal(true);
                setLoading(false);
              }
            }}
            className={`w-full py-4 cursor-pointer rounded-2xl font-medium text-white ${loading ? "bg-pink-400" : "bg-pink-500 hover:bg-pink-600"}`}
          >
            {loading ? (
              <>
                <span className="flex items-center gap-2">Procesando...</span>
                <LoaderBar />
              </>
            ) : (
              "Finalizar compra"
            )}
          </button>
        </div>
      </div>

      {showWhatsappModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowWhatsappModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Confirmar pedido</h2>
            <p className="text-gray-600 text-sm mb-4">
              Serás redirigido a WhatsApp.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowWhatsappModal(false)}
                className="px-4 py-2 border rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransferencia}
                className="px-5 py-2 bg-pink-500 text-white rounded-xl cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center">
            <h2 className="text-xl font-bold mb-2">Iniciá sesión</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Necesitamos que inicies sesión para finalizar el pedido.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold"
              >
                Ir a iniciar sesión
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
