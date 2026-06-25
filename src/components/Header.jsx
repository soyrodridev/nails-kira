import { useState, useContext, useEffect } from "react";
import Cart from "./Card";
import { ShopContext } from "../context/ShopContext";
import { supabaseClient as supabase } from "../lib/supabase";

export default function Header() {
  const { search, setSearch, cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(ShopContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  
  // Estados para Auth
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    // Obtener usuario al cargar
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    // Escuchar cambios de auth
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      <header className="w-full bg-pink-50/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <nav className="max-w-6xl m-auto flex justify-between items-center h-28 px-4">
          {/* Logo */}
          <a href="/">
            <img src="/logo-nail.svg" alt="Logo" className="w-32 md:w-36" />
          </a>

          {/* Menu */}
          <nav className={`absolute md:static top-28 left-0 w-full md:w-auto bg-white md:bg-transparent border-b border-pink-100 md:border-none transition-all ${menuOpen ? "block" : "hidden md:block"}`}>
            <ul className="flex flex-col md:flex-row md:space-x-4">
              <li className="py-4 pl-4 md:p-0"><a href="/" className="text-[1.1rem]">Productos</a></li>
              <li className="py-4 pl-4 md:p-0"><a href="" className="text-[1.1rem]">Acerca de</a></li>
            </ul>
            <div className="p-4 md:hidden"><SearchInput search={search} setSearch={setSearch} /></div>
          </nav>

          {/* Derecha */}
          <div className="flex space-x-3 items-center">
            {/* Buscador Desktop */}
            <div className="hidden md:block"><SearchInput search={search} setSearch={setSearch} /></div>

            {/* Login / Perfil Circular */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className="w-10 h-10 rounded-full bg-pink-500 border-2 border-white shadow-md flex items-center justify-center font-bold text-white hover:scale-105 transition-transform"
                >
                  {user.email.charAt(0).toUpperCase()}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-pink-50">
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <a href="/cliente/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition">Mi Perfil / Pedidos</a>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition">Cerrar sesión</button>
                  </div>
                )}
              </div>
            ) : (
              <a 
                href="/login" 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-pink-200 text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-sm"
                title="Iniciar sesión"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </a>
            )}

            {/* Carrito */}
            <button onClick={() => setCartOpen(true)} className="relative bg-pink-500 hover:bg-pink-600 transition p-3 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1 5h12m-9 0a1 1 0 102 0m6 0a1 1 0 102 0" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-white text-pink-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartItems.reduce((total, item) => total + item.cantidad, 0)}
              </span>
            </button>

            {/* Menu Mobile */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="bg-white border border-pink-200 p-3 rounded-full shadow-md md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <Cart 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cartItems={cartItems} 
        removeFromCart={removeFromCart} 
        increaseQuantity={increaseQuantity} 
        decreaseQuantity={decreaseQuantity} 
      />
    </>
  );
}

function SearchInput({ search, setSearch }) {
    return (
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 border border-pink-200 rounded-full py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      );
}