import React from 'react';

function Welcome() {
  return (
    <section className="w-full max-w-6xl m-auto px-4 py-8">
      <div className="w-full bg-pink-50 rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-lg border border-pink-100">
        
        <div className="flex-1 p-8 md:p-16 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Manicura profesional <br />
            <span className="text-pink-600">en minutos.</span>
          </h2>
          <p className="text-gray-600 text-lg mb-6 max-w-lg">
            Consigue el diseño perfecto con nuestras <strong>Press-on Nails</strong>. 
            Reutilizables, resistentes y listas para usar. ¡Luce uñas de salón sin salir de casa!
          </p>
          <button className="px-8 cursor-pointer py-3 bg-lime-300 hover:bg-lime-400 text-gray-900 font-bold rounded-full transition-all shadow-md transform hover:scale-105">
            Comprar ahora
          </button>
        </div>

        <div className="w-full rounded-l-2xl md:w-1/2 h-64 md:h-80 bg-pink-100 flex items-center justify-center relative border-l-0 md:border-l border-pink-200">
          
          
          <img src="/presspng.png" alt="Press on Nails" className="object-contain w-full h-full" />
        </div>

      </div>
    </section>
  );
}

export default Welcome;