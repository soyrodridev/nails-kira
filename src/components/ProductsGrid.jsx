import React from "react";

function ProductsGrid({ productos, addToCart }) {
  return (
    <section className="py-4">
      <ul className="gridContainer">

        {productos?.map((p) => (
          <li key={p.id}>

            {/* Link Card */}
            <a href={`/producto/${p.id}`}>

              <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300">

                <img
                  src={p.imagen_url}
                  alt={p.titulo}
                  className="w-full h-100 object-cover group-hover:scale-110 transition duration-500"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/0 to-transparent" />

                <div className="absolute bottom-0 p-4 w-full text-white">

                  <h3 className="text-lg font-semibold tracking-wide">
                    {p.titulo}
                  </h3>

                  <p className="text-sm opacity-80">
                    Diseño premium y duradero
                  </p>

                  <div className="flex items-center justify-between mt-3">

                    <h4 className="text-lg font-bold">
                      <span className="font-bold">$</span>{" "}
                      {Number(p.precio).toLocaleString("es-AR")}
                    </h4>

                    {/* Botón */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(p);
                      }}
                      className="
                        flex items-center gap-2

                        bg-white/20
                        backdrop-blur-md
                        border border-white/30

                        text-white
                        text-sm
                        font-medium

                        px-4 py-2
                        rounded-full

                        shadow-lg
                        opacity-100
                        md:opacity-0
                        md:translate-y-3

                        md:group-hover:opacity-100
                        md:group-hover:translate-y-0

                        hover:bg-pink-500
                        hover:border-pink-400
                        hover:scale-105

                        active:scale-95

                        transition-all duration-300
                        cursor-pointer
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4"
                        />
                      </svg>

                      Agregar
                    </button>

                  </div>
                </div>
              </div>

            </a>
          </li>
        ))}

      </ul>
    </section>
  );
}

export default ProductsGrid;