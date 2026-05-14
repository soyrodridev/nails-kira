import { useEffect } from "react";

export default function Cart({
  open,
  onClose,
  cartItems = [],
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
}) {

  // Bloquear scroll
  useEffect(() => {

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };

  }, [open]);

  // Total carrito
  const total = cartItems.reduce(
    (acc, item) =>
      acc + item.precio * item.cantidad,
    0
  );

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0
          bg-black/40
          z-40
          transition-opacity duration-300
          ${open ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0
          h-dvh w-[320px]
          bg-white
          z-50
          shadow-2xl
          transition-transform duration-300
          flex flex-col
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-pink-100">

          <h2 className="text-xl font-semibold text-pink-600">
            Carrito
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-black transition"
          >
            ×
          </button>

        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5">

          {cartItems.length === 0 ? (

            <p className="text-gray-500">
              Tu carrito está vacío.
            </p>

          ) : (

            <div className="space-y-4">

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="flex gap-3 border-b border-pink-100 pb-4"
                >

                  {/* Imagen */}
                  <img
                    src={item.imagen_url}
                    alt={item.titulo}
                    className="w-16 h-16 object-cover rounded-xl"
                  />

                  {/* Info */}
                  <div className="flex-1">

                    <h3 className="font-medium text-sm">
                      {item.titulo}
                    </h3>

                    <div className="flex justify-between items-center mt-2">

                      {/* Precio */}
                      <p className="text-pink-600 font-semibold">
                        $
                        {Number(item.precio).toLocaleString("es-AR")}
                      </p>

                      {/* Cantidad */}
                      <div className="flex items-center gap-2">

                        {/* Menos */}
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="
                            w-7 h-7
                            rounded-full
                            bg-pink-100
                            hover:bg-pink-200
                            transition
                            cursor-pointer
                          "
                        >
                          -
                        </button>

                        {/* Número */}
                        <span className="font-medium min-w-5 text-center">
                          {item.cantidad}
                        </span>

                        {/* Más */}
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="
                            w-7 h-7
                            rounded-full
                            bg-pink-500
                            text-white
                            hover:bg-pink-600
                            transition
                            cursor-pointer
                          "
                        >
                          +
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Footer */}
        {cartItems.length > 0 && (

          <div className="
           p-5
    border-t
    border-pink-100
    bg-white
    pb-[calc(env(safe-area-inset-bottom)+20px)]
          ">

            {/* Total */}
            <div className="flex items-center justify-between mb-4">

              <span className="font-medium text-gray-600">
                Total
              </span>

              <span className="text-xl font-bold text-pink-600">
                ${total.toLocaleString("es-AR")}
              </span>

            </div>

            {/* Botón */}
            <a
  href="/checkout"
  onClick={onClose}
  className="
    block
    w-full
    text-center
    bg-pink-500
    hover:bg-pink-600
    text-white
    py-3
    rounded-xl
    font-medium
    transition
    cursor-pointer
  "
>
  Finalizar compra
</a>

          </div>

        )}

      </div>
    </>
  );
}