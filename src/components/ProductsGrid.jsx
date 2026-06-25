import React from "react";

function ProductsGrid({ productos, addToCart }) {
  return (
    // Aumenté el padding horizontal y vertical para que respire mejor
    <section className="py-12 px-6 max-w-7xl mx-auto">
      {/* 
        Ajuste clave:
        - móvil: 1 columna (para que sean grandes)
        - tablet (md): 2 columnas
        - desktop (lg): 3 columnas
        - gap-8: más espacio entre tarjetas
      */}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {productos?.map((p) => (
          <li key={p.id} className="group">
            <a href={`/producto/${p.id}`} className="block">
              {/* Contenedor principal con más altura */}
              <div className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
                
                {/* Imagen más alta (aspect-square o 4/5 para mayor presencia) */}
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={p.imagen_url}
                    alt={p.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90" />

                {/* Contenido con mayor tamaño de letra y padding */}
                <div className="absolute bottom-0 p-8 w-full text-white">
                  <h3 className="text-2xl font-bold tracking-tight leading-tight mb-1">
                    {p.titulo}
                  </h3>
                  <p className="text-sm text-pink-200 font-medium uppercase tracking-widest mb-6">
                    Almendra larga
                  </p>

                  <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-extrabold">
                      ${Number(p.precio).toLocaleString("es-AR")}
                    </h4>

                    {/* Botón más grande y fácil de tocar */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(p);
                      }}
                      className="flex items-center gap-2  cursor-pointer bg-lime-300 hover:bg-lime-400 text-gray-900 text-sm font-bold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
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