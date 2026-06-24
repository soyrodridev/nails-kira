import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({ children, username, role, tieneNotificaciones }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* El Sidebar ahora sabe el rol para ocultar botones como "Finanzas" */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={role} />

      <main className="flex-1">
        <Topbar
          username={username}
          tieneNotificaciones={tieneNotificaciones} // <--- Pasamos la alerta aca
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}