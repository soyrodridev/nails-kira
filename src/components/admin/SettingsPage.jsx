import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [originalUsuarios, setOriginalUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cambiar-rol");
      const data = await res.json();
      setUsuarios(data || []);
      setOriginalUsuarios(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const hayCambios = JSON.stringify(usuarios) !== JSON.stringify(originalUsuarios);

  const handleRolChange = (id, nuevoRol) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, role: nuevoRol } : u)));
  };

  async function guardarCambios() {
    setGuardando(true);
    try {
      await fetch("/api/admin/cambiar-rol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarios }),
      });
      setOriginalUsuarios(usuarios);
      alert("Cambios guardados correctamente");
    } catch (err) {
      alert("Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-10 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Configuración */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-6">Configuración</h2>
        <div className="space-y-5">
          <input placeholder="Nombre del negocio" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-500/20" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input placeholder="WhatsApp" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-500/20" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          <input placeholder="Instagram" className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-500/20" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          <button className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-6 py-3 rounded-xl transition w-full md:w-auto">
            Guardar cambios
          </button>
        </div>
      </div>

      {/* Gestión de Usuarios */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Gestión de Usuarios</h2>
            <p className="text-gray-500 text-sm md:text-base">Administrá los roles de tu equipo.</p>
          </div>
          <button 
            onClick={guardarCambios}
            disabled={!hayCambios || guardando}
            className={`w-full sm:w-auto font-bold py-3 px-6 rounded-2xl transition-all ${
              !hayCambios || guardando 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-200 active:scale-95"
            }`}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        <div className="px-4 pb-8 md:px-8 space-y-4">
          {loading ? (
            <p className="text-center py-10 text-gray-400">Cargando usuarios...</p>
          ) : (
            usuarios.map((u) => (
              <div key={u.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 gap-4 hover:border-pink-200 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-lg">{u.username}</span>
                  <span className="text-sm text-gray-400">{u.email}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Select personalizado */}
                  <div className="relative w-full md:w-48">
                    <select 
                      value={u.role} 
                      onChange={(e) => handleRolChange(u.id, e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 text-gray-700 font-bold py-3 pl-4 pr-10 rounded-2xl cursor-pointer hover:border-pink-300 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                    >
                      <option value="cliente">Cliente</option>
                      <option value="kiosco">Kiosco</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  {/* Botón Eliminar */}
                  <button 
                    onClick={() => alert("Funcionalidad en desarrollo")}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}