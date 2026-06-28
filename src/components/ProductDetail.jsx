import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";

function ProductDetail({ producto }) {
  const ctx = useContext(ShopContext);
  const [selectedTalle, setSelectedTalle] = useState("M");
  const [showModal, setShowModal] = useState(false); // Estado para el modal

  if (!ctx) return <div className="py-20 text-center text-red-500">❌ Context no disponible</div>;
  const { addToCart } = ctx;
  if (!producto) return <div className="py-20 text-center text-gray-500">Producto no encontrado</div>;

  const talles = ["S", "M", "L", "P"];

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 relative">
        
        {/* --- MODAL --- */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center border border-pink-100">
              <h3 className="text-xl font-bold text-[#1e1e2d] mb-4 cursor-pointer">¿No sabes tu talle?</h3>
              <p className="text-[#4a4a5a] mb-6">
                ¡No te preocupes! Selecciona la opción <b>P (Personalizado)</b>. Una vez realizada la compra, te contactaremos por WhatsApp para tomar tus medidas exactas.
              </p>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-[#eb1d81] text-white font-bold py-3 rounded-full hover:bg-[#d61a75] transition"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        )}
      
        {/* --- CONTENIDO --- */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Imagen */}
          <div className="relative group">
            <div className="absolute inset-0 bg-pink-200 blur-3xl opacity-20 rounded-4xl"></div>
            <div className="relative overflow-hidden rounded-[2rem] bg-pink-50 shadow-2xl border border-pink-100">
              <img src={producto.imagen_url} alt={producto.titulo} className="w-full h-full object-cover aspect-square" />
            </div>
          </div>
      
          {/* Info */}
          <div>
            <span className="inline-flex items-center bg-pink-100 text-pink-600 text-sm font-medium px-4 py-1.5 rounded-full mb-5">✨ Press On Nails</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">{producto.titulo}</h1>
            <p className="text-gray-500 text-lg mb-8">Diseños premium hechos a mano con acabado profesional.</p>
      
            <div className="mb-10">
              <p className="text-sm text-gray-400 mb-1">Precio</p>
              <h2 className="text-5xl font-bold text-pink-600">${Number(producto.precio).toLocaleString("es-AR")}</h2>
            </div>
      
            <div className="mb-10">
              <div className="flex justify-between items-center mb-3">
                <p className="text-pink-500 text-sm font-medium">Seleccionar talle</p>
                <button onClick={() => setShowModal(true)} className="text-pink-600 text-sm font-semibold hover:underline">
                  ¿No sabes tu talle?
                </button>
              </div>
              
              <div className="flex gap-2">
                {talles.map((talle) => (
                  <button
                    key={talle}
                    onClick={() => setSelectedTalle(talle)}
                    className={`w-12 h-12 rounded-xl border-2 transition-all font-semibold ${selectedTalle === talle ? "border-[#eb1d81] bg-[#eb1d81] text-white shadow-lg" : "border-gray-200 bg-white text-gray-600 hover:border-pink-300"}`}
                  >
                    {talle}
                  </button>
                ))}
              </div>
            </div>
      
            <button
              onClick={() => addToCart({ ...producto, talleSeleccionado: selectedTalle })}
              className="w-full md:w-auto bg-pink-500 cursor-pointer hover:bg-pink-600 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg shadow-pink-200 transition"
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