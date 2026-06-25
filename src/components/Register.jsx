import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Bloqueo de entrada en tiempo real
  const handleUsernameChange = (e) => {
    // Solo letras y espacios
    const value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g, "");
    setUsername(value);
  };

  const handleTelefonoChange = (e) => {
    // Solo números y máximo 10 caracteres
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setTelefono(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. Validación de campos vacíos
    if (!email || !username || !telefono || !password || !confirmPassword) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    // 2. Validación de Nombre (mínimo 3 letras)
    if (username.length < 3) {
      setError("El nombre debe tener al menos 3 letras.");
      return;
    }

    // 3. Validación de Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    // 4. Validación exacta de 10 dígitos para teléfono
    if (telefono.length !== 10) {
      setError("El número de teléfono debe tener exactamente 10 dígitos.");
      return;
    }

    // 5. Validación de Contraseña (1 Mayúscula, 1 Número, 1 Signo, mín 8 caracteres)
    const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passRegex.test(password)) {
      setError("La contraseña debe tener 8+ caracteres, 1 mayúscula, 1 número y 1 signo.");
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
      formData.append("telefono", telefono);
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
      setTelefono("");
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
          Registrate para gestionar tus pedidos
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

          {/* Nombre de Usuario */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Nombre y Apellido
            </label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Ej: Juan Perez"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Numero de telefono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={handleTelefonoChange}
              placeholder="Ej: 3871234567"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            />
          </div>


          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@correo.com"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            />
          </div>

          
          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            />
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-sm shadow-md transition active:scale-[0.98] mt-2 disabled:opacity-50"
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