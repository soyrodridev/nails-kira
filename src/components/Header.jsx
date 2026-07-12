import { useState, useContext, useEffect } from "react";
import Cart from "./Card";
import { ShopContext } from "../context/ShopContext";
import { supabaseClient as supabase } from "../lib/supabase";

export default function Header() {
  const {  search, setSearch, cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(ShopContext);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/api/auth/signout";
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  return (
    <>
      <header className="w-full bg-pink-50/80 backdrop-blur-md border-pink-100 border-b sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto relative flex items-center justify-between h-20 px-6">
         
          <a href="/" className="shrink-0 z-20">
            <img src="/logo-nail.svg" alt="Logo" className="w-28" />
          </a>

          <ul className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            <li>
              <a href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-pink-600 uppercase tracking-wider transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Productos
              </a>
            </li>
            <li>
              <a href="/acerca" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-pink-600 uppercase tracking-wider transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Nosotras
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-6 z-20">
            <div className="hidden md:flex relative items-center justify-end w-48">
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`bg-gray-50 border border-gray-200 rounded-full py-1 pl-4 pr-10 text-sm transition-all duration-300 outline-none focus:border-pink-500 ${searchOpen ? "w-full opacity-100" : "w-0 opacity-0 pointer-events-none"}`}
              />
              <button onClick={() => setSearchOpen(!searchOpen)} className="absolute right-0 hover:text-pink-600 transition p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>

            <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden hover:text-pink-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>

            {/* Carrito */}
            <button onClick={() => setCartOpen(true)} className="relative hover:text-pink-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}
                </span>
              )}
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>

            <div className="relative hidden md:block">
              {user ? (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="text-sm font-medium text-gray-800 hover:text-pink-600 transition uppercase tracking-wider">{user.username}</button>
              ) : (
                <a href="/login" className="text-sm font-medium text-gray-800 hover:text-pink-600 transition uppercase tracking-wider">Ingresar</a>
              )}
              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl border border-pink-100 py-2 z-50">
                  <a href="/cliente" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-pink-50">Ver Perfil</a>
                  <a href="/cliente/pedidos" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-pink-50">Mis Pedidos</a>
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-pink-50">Cerrar sesión</button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {searchOpen && (
          <div className="md:hidden px-6 pb-4 bg-pink-50/80 backdrop-blur-md">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 px-4 text-sm outline-none focus:border-pink-500"
            />
          </div>
        )}

        {menuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 p-6 space-y-4 shadow-lg">
            <a href="/" className="flex items-center gap-3 text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>Productos</a>
            <a href="/acerca" className="flex items-center gap-3 text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Nosotras</a>
            <div className="border-t pt-4">
              {user ? (
                <>
                  <p className="font-bold text-pink-600 mb-2 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{user.username}</p>
                  <a href="/cliente" className="block py-2 text-gray-600 flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Ver Perfil</a>
                  <a href="/cliente/pedidos" className="block py-2 text-gray-600 flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>Mis Pedidos</a>
                  <button onClick={handleLogout} className="block py-2 text-red-500 flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Cerrar sesión</button>
                </>
              ) : (
                <a href="/login" className="block py-2 text-gray-800 font-medium flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>Ingresar</a>
              )}
            </div>
          </div>
        )}
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