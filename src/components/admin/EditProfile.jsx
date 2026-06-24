import { useState, useEffect } from "react";

export default function EditProfile({ currentUsername }) {
  const [username, setUsername] = useState(currentUsername || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (currentUsername) setUsername(currentUsername);
  }, [currentUsername]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!username.trim()) {
      setMessage({ text: "El nombre de usuario no puede estar vacío.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      // Enviamos el dato al backend de Astro mediante FormData
      const formData = new FormData();
      formData.append("username", username.trim());

      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "Error al actualizar el perfil");
      }

      setMessage({ 
        text: "¡Nombre de usuario actualizado con éxito! Recargando panel...", 
        type: "success" 
      });

      // Forzamos la recarga de la página tras un segundo para que impacte el cambio en el Topbar
      setTimeout(() => {
        window.location.reload();
      }, 1200);

    } catch (err) {
      setMessage({ text: err.message || "Error al actualizar.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 max-w-md border border-gray-100 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-800">Mi Perfil</h3>
        <p className="text-sm text-gray-500">Editá tu información de cuenta</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        {message.text && (
          <div className={`p-4 text-sm rounded-2xl font-medium border ${
            message.type === "success" 
              ? "text-green-600 bg-green-50 border-green-100" 
              : "text-red-600 bg-red-50 border-red-100"
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            Nombre de Usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nuevo nombre de usuario"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold text-sm shadow-md shadow-fuchsia-600/20 transition active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}