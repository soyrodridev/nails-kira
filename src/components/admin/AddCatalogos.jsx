import { useState } from "react";
import ProductForm from "./CatalogoForm";
import CatalogList from "./CatalogoList";
import ControlSesion from "./ControlSesion";

export default function AddCatalogos() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-8">
      {/* Botón de acción principal */}
        <ControlSesion />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Catálogo</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-pink-600 transition shadow-lg shadow-pink-200"
        >
          {showForm ? "Cerrar Formulario" : "+ Añadir Producto"}
        </button>
      </div>

      {/* Formulario (se muestra solo al hacer click) */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <ProductForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {/* Lista de productos abajo */}
      <CatalogList />
    </div>
  );
}