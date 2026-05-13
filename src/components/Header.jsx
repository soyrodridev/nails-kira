import { useState } from "react";
import Cart from "./Card";

export default function Header({
  search,
  setSearch,
  cartItems,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
}) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-pink-50/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">

        <nav className="max-w-6xl m-auto flex justify-between items-center h-28 px-4">

          {/* Logo */}
          <img
            src="/logo-nail.svg"
            alt="Logo de Nails Kira"
            className="w-32 md:w-36"
          />

          {/* Menu */}
          <nav
            className={`
              absolute md:static
              top-28 left-0
              w-full md:w-auto
              bg-white md:bg-transparent
              border-b border-pink-100 md:border-none
              transition-all
              ${menuOpen ? "block" : "hidden md:block"}
            `}
          >

            <ul className="flex flex-col md:flex-row md:space-x-4">

              <li className="py-4 pl-4 md:p-0">
                <a href="" className="text-[1.1rem]">
                  Productos
                </a>
              </li>

              <li className="py-4 pl-4 md:p-0">
                <a href="" className="text-[1.1rem]">
                  Acerca de
                </a>
              </li>

            </ul>

            {/* Buscador Mobile */}
            <div className="p-4 md:hidden">
              <SearchInput
                search={search}
                setSearch={setSearch}
              />
            </div>

          </nav>

          {/* Derecha */}
          <div className="flex space-x-2 items-center">

            {/* Buscador Desktop */}
            <div className="hidden md:block">
              <SearchInput
                search={search}
                setSearch={setSearch}
              />
            </div>

            {/* Carrito */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-pink-500 hover:bg-pink-600 transition p-3 rounded-full shadow-md"
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1 5h12m-9 0a1 1 0 102 0m6 0a1 1 0 102 0"
                />
              </svg>

              {/* Contador */}
              <span className="absolute -top-1 -right-1 bg-white text-pink-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>

            </button>

            {/* Menu Mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-white border border-pink-200 p-3 rounded-full shadow-md hover:bg-pink-100 transition md:hidden"
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-pink-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>

            </button>

          </div>
        </nav>
      </header>

      {/* Carrito */}
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
        className="
          w-full md:w-64
          border border-pink-200
          rounded-full
          py-2.5 pl-11 pr-4
          outline-none
          focus:ring-2 focus:ring-pink-300
          text-sm
          bg-white
        "
      />

      {/* Lupa */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

    </div>
  );
}