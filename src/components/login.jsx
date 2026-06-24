import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(false);

    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      
      // Enviamos los datos al endpoint de la API de Astro como FormData
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Error al iniciar sesión");
      }

      // Si todo sale bien, el endpoint nos redirige o cambiamos la ubicación en el cliente
      window.location.href = "/admin/dashboard";
    } catch (err) {
      // 🔄 Traducimos el mensaje crudo que viene desde Supabase
      if (err.message.includes("Invalid login credentials")) {
        setError("El correo o la contraseña son incorrectos.");
      } else if (err.message.includes("Email not confirmed")) {
        setError("Por favor, verifica tu correo electrónico antes de ingresar.");
      } else {
        // Fallback por si ocurre algún otro error de red o servidor
        setError(err.message || "Ocurrió un error al intentar iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e8e8] flex justify-center items-center p-4">
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] w-full max-w-md shadow-xl border border-gray-100">
        
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 text-center mb-6 tracking-tight">
          Control de Acceso
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Alerta de Error */}
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Input Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@correo.com"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-sm shadow-md shadow-fuchsia-600/20 transition active:scale-[0.98] mt-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Verificando..." : "Ingresar al panel"}
          </button>

          <div className="text-center pt-2">
            <a href="/register" className="text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-700 transition">
              ¿No tenés cuenta? Registrate acá
            </a>
          </div>

        </form>
      </div>
    </div>
  );
}