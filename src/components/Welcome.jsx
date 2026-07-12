import React from 'react';

function Welcome() {
  return (
    <section className="w-screen relative overflow-hidden bg-white">
      
      <div className="absolute inset-0 bg-linear-to-br from-pink-100 via-pink-50 to-white z-0"></div>

      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center justify-between">
        
        <div className="flex-1 text-center md:text-left">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm font-bold tracking-wider uppercase mb-6 shadow-sm">
            Nueva Colección 2026
          </span>
          
          <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1]">
            Manicura profesional <br />
            <span className="text-pink-600">en minutos.</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
            Consigue el diseño perfecto con nuestras <strong>Press-on Nails</strong>. 
            Reutilizables, resistentes y listas para usar. ¡Luce uñas de salón sin salir de casa!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button className="px-10 py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg rounded-full transition-all shadow-xl shadow-pink-200 transform hover:-translate-y-1 active:scale-95 cursor-pointer">
              Comprar ahora
            </button>
            <button className="px-10 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold text-lg rounded-full border-2 border-gray-200 cursor-pointer transition-all">
              Ver catálogo
            </button>
          </div>
        </div>
      
        <div className="w-full md:w-1/2 mt-12 md:mt-0 flex justify-center items-center relative">
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
            <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
            
            <img 
              src="/logo-nail.svg" 
              alt="Press on Nails" 
              className="relative z-10 w-full h-auto object-contain hover:scale-105 transition-transform duration-500" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Welcome;