import { useEffect, useState } from "react";
import Header from "./Header";
import Toast from "./Toast";

export default function Shop({ children }) {

  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // cargar carrito
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // guardar carrito
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (producto) => {

    setCartItems((prev) => {
      const existe = prev.find((item) => item.id === producto.id);

      if (existe) {
        return prev.map((item) => {
          if (item.id === producto.id) {
            return {
              ...item,
              cantidad: item.cantidad + 1,
            };
          }
          return item;
        });
      }

      return [
        ...prev,
        { ...producto, cantidad: 1 },
      ];
    });

    setToastMessage(`${producto.titulo} agregado al carrito`);
    setToastOpen(true);

    setTimeout(() => setToastOpen(false), 2500);
  };

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

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

  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <>
      {/* HEADER GLOBAL */}
      <Header
        search={search}
        setSearch={setSearch}
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
      />

      {/* CONTENIDO DE LA PÁGINA */}
      {children({
        search,
        addToCart,
        cartItems
      })}

      <Toast
        open={toastOpen}
        message={toastMessage}
      />
    </>
  );
}