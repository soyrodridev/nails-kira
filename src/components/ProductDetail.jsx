import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

function ProductDetail({ producto }) {
  const ctx = useContext(ShopContext);

  if (!ctx) {
    return (
      <div className="py-20 text-center text-red-500">
        ❌ Context no disponible
      </div>
    );
  }

  const { addToCart } = ctx;

  if (!producto) {
    return (
      <div className="py-20 text-center text-gray-500">
        Producto no encontrado
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Imagen */}
        <div className="relative group">

          {/* Glow */}
          <div className="absolute inset-0 bg-pink-200 blur-3xl opacity-20 rounded-[2rem] group-hover:opacity-30 transition duration-500"></div>

          <div className="relative overflow-hidden rounded-[2rem] bg-pink-50 shadow-2xl border border-pink-100">

            <img
              src={producto.imagen_url}
              alt={producto.titulo}
              className="
                w-full
                h-full
                object-cover
                aspect-square
                group-hover:scale-105
                transition
                duration-500
              "
            />

          </div>

        </div>

        {/* Info */}
        <div>

          {/* Categoria */}
          <span className="
            inline-flex
            items-center
            bg-pink-100
            text-pink-600
            text-sm
            font-medium
            px-4
            py-1.5
            rounded-full
            mb-5
          ">
            ✨ Press On Nails
          </span>

          {/* Titulo */}
          <h1 className="
            text-4xl
            md:text-5xl
            font-bold
            text-gray-900
            leading-tight
            mb-5
          ">
            {producto.titulo}
          </h1>

          {/* Descripcion */}
          <p className="
            text-gray-500
            text-lg
            leading-relaxed
            mb-8
          ">
            Diseños premium hechos a mano con acabado profesional.
            Elegantes, resistentes y perfectos para cualquier ocasión.
          </p>

          {/* Precio */}
          <div className="mb-10">

            <p className="text-sm text-gray-400 mb-1">
              Precio
            </p>

            <h2 className="
              text-5xl
              font-bold
              text-pink-600
              tracking-tight
            ">
              $
              {Number(producto.precio).toLocaleString("es-AR")}
            </h2>

          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-10">

            <div className="
              bg-white
              border
              border-pink-100
              rounded-2xl
              p-4
              shadow-sm
            ">
              <p className="text-pink-500 text-sm font-medium mb-1">
                Calidad
              </p>

              <p className="text-gray-700 font-semibold">
                Premium
              </p>
            </div>

            <div className="
              bg-white
              border
              border-pink-100
              rounded-2xl
              p-4
              shadow-sm
            ">
              <p className="text-pink-500 text-sm font-medium mb-1">
                kit
              </p>

              <p className="text-gray-700 font-semibold">
                30 dias
              </p>
            </div>

          </div>

          {/* Boton */}
          <button
            onClick={() => {
              console.log("🔥 CLICK DETECTADO EN PRODUCT DETAIL");
              console.log("PRODUCTO:", producto);
              console.log("CTX addToCart:", addToCart);

              addToCart(producto);
            }}
            className="
              w-full md:w-auto
              bg-pink-500
              hover:bg-pink-600
              active:scale-[0.98]
              text-white
              text-lg
              font-semibold
              px-10
              py-4
              rounded-2xl
              shadow-lg
              shadow-pink-200
              transition
              duration-300
              cursor-pointer
            "
          >
            Agregar al carrito
          </button>

        </div>

      </div>

    </section>
  );
}

export default ProductDetail;