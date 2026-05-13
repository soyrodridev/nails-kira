import { useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Header from "./Header";
import Toast from "./Toast";

export default function ShopProvider({ children }) {

  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // ⚠️ FIX SSR SAFETY (IMPORTANTE EN ASTRO / VERCEL)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // =========================
  // ✅ ADD TO CART (NO TOCAR)
  // =========================
  const addToCart = (producto) => {
    console.log("🛒 addToCart EJECUTADO");
    console.log("PRODUCTO RECIBIDO:", producto);

    setCartItems((prev) => {
      const existe = prev.find((i) => i.id === producto.id);

      if (existe) {
        return prev.map((i) =>
          i.id === producto.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }

      return [...prev, { ...producto, cantidad: 1 }];
    });

    setToastMessage(`${producto.titulo} agregado al carrito`);
    setToastOpen(true);

    setTimeout(() => setToastOpen(false), 2500);
  };

  // =========================
  // ✅ INCREASE
  // =========================
  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  // =========================
  // ✅ DECREASE
  // =========================
  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  // =========================
  // ✅ REMOVE
  // =========================
  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // =========================
  // ✅ CONTEXT VALUE (IMPORTANTE)
  // =========================
  const value = {
    search,
    setSearch,
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  };

  return (
    <ShopContext.Provider value={value}>

      {children}

      <Toast
        open={toastOpen}
        message={toastMessage}
      />

    </ShopContext.Provider>
  );
}