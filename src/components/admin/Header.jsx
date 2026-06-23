export default function Header({ setSidebarOpen }) {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
        >
          ☰
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h2>

          <p className="text-sm text-gray-500">
            Bienvenido nuevamente 👋
          </p>
        </div>
      </div>

      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white flex items-center justify-center font-bold">
        A
      </div>
    </header>
  );
}