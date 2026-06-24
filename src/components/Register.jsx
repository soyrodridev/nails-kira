import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !username || !password || !confirmPassword) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const textResponse = await response.text();

      if (!response.ok) {
        throw new Error(textResponse || "Error al crear la cuenta");
      }

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      setSuccess(textResponse);
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e8e8] flex justify-center items-center p-4">
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] w-full max-w-md shadow-xl border border-gray-100">
        
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 text-center mb-2 tracking-tight">
          Crear Cuenta
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Registrate para administrar tu sistema
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl font-medium border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 text-sm text-green-600 bg-green-50 rounded-2xl font-medium border border-green-100">
              {success}
            </div>
          )}

          {/* Input Nombre de Usuario */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: UserName"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

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

          {/* Input Contraseña */}
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

          {/* Input Confirmar Contraseña */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-sm shadow-md shadow-fuchsia-600/20 transition active:scale-[0.98] mt-2 disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <div className="text-center pt-2">
            <a href="/login" className="text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-700 transition">
              ¿Ya tenés cuenta? Iniciá sesión
            </a>
          </div>

        </form>
      </div>
    </div>
  );
}