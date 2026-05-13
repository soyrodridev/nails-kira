import React from "react";


function ProductDetail({ producto }) {

  if (!producto) {
    return (
      <div className="py-20 text-center">
        Producto no encontrado
      </div>
    );
  }

  return (
    <>
    
        <section className="max-w-6xl mx-auto px-4 py-10">
        
          <div className="grid md:grid-cols-2 gap-10">
        
            {/* Imagen */}
            <div className="rounded-3xl overflow-hidden shadow-xl">
        
              <img
                src={producto.imagen_url}
                alt={producto.titulo}
                className="w-full h-full object-cover"
              />
        
            </div>
        
            {/* Info */}
            <div className="flex flex-col justify-center">
        
              <p className="text-pink-500 font-medium mb-2">
                Press On Nails
              </p>
        
              <h1 className="text-4xl font-bold mb-4">
                {producto.titulo}
              </h1>
        
              <p className="text-gray-500 text-lg mb-6">
                Diseño premium y duradero.
                Hechas a mano con acabado profesional.
              </p>
        
              <h2 className="text-4xl font-bold text-pink-600 mb-8">
                $
                {Number(producto.precio).toLocaleString("es-AR")}
              </h2>
        
              <button
               onClick={() => addToCart(producto)}
                className="
                  bg-pink-500
                  hover:bg-pink-600
                  text-white
                  py-4
                  rounded-2xl
                  text-lg
                  font-medium
                  transition
                "
              >
                Agregar al carrito
              </button>
        
            </div>
        
          </div>
        
        </section>
    </>
  );
}

export default ProductDetail;