import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

import DashboardStats from "./DashboardStats";
import ProductModal from "./ProductModal";
import SaleProductModal from "./SaleProductModal";

export default function ProductsTable() {
  const [productos, setProductos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productoVenta, setProductoVenta] = useState(null);
  const [openVenta, setOpenVenta] = useState(false);

  const fetchProductos = async () => {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    setProductos(data || []);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleDelete = async (producto) => {
  const ok = confirm(
    `¿Eliminar "${producto.titulo}"?`
  );

  if (!ok) return;

  try {
    // Intentar eliminar imagen si existe
    if (producto.imagen_url) {
      const filePath = producto.imagen_url.split(
        "/storage/v1/object/public/productos/"
      )[1];

      if (filePath) {
        const { error: storageError } =
          await supabase.storage
            .from("productos")
            .remove([filePath]);

        // Solo mostramos el error, no detenemos el proceso
        if (storageError) {
          console.log(
            "No se pudo eliminar la imagen:",
            storageError.message
          );
        }
      }
    }

    // Eliminar producto de la BD
    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", producto.id);

    if (error) throw error;

    fetchProductos();
  } catch (error) {
    console.log(error);
    alert("Error eliminando producto");
  }
};

  return (
    <>
      <DashboardStats productos={productos} />

     <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
  {/* Header */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-4 border-b border-gray-100">
    <div>
      <h3 className="font-bold text-xl">Productos</h3>
      <p className="text-sm text-gray-500">Gestiona tu catálogo</p>
    </div>

    <button
      onClick={() => {
        setEditingProduct(null);
        setOpenModal(true);
      }}
      className="w-full sm:w-auto text-center bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition cursor-pointer px-5 py-2.5 rounded-2xl font-medium text-sm"
    >
      + Nuevo producto
    </button>
  </div>

  {/* Vista de Escritorio (Tabla tradicional - Oculta en móviles) */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Producto</th>
          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Precio</th>
          <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Fecha</th>
          <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {productos.map((producto) => (
          <tr
            key={producto.id}
            className="border-t border-gray-100 hover:bg-gray-50/50 transition"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <img
                  src={producto.imagen_url}
                  alt={producto.titulo}
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                />
                <div>
                  <p className="font-semibold text-gray-800 leading-tight mb-1">{producto.titulo}</p>
                  <p className="text-xs font-mono text-gray-400">ID #{producto.id.substring(0, 8)}...</p>
                </div>
              </div>
            </td>

            <td className="px-6 py-4 font-semibold text-gray-800">
              ${Number(producto.precio).toLocaleString("es-AR")}
            </td>

            <td className="px-6 py-4 text-sm text-gray-500">
              {new Date(producto.created_at).toLocaleDateString("es-AR")}
            </td>

            <td className="px-6 py-4">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(producto);
                    setOpenModal(true);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(producto)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  Eliminar
                </button>

                <button
                  onClick={() => {
                    setProductoVenta(producto);
                    setOpenVenta(true);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 transition"
                >
                  Vender
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Vista de Celular (Tarjetas / Cards - Oculta en pantallas medianas/grandes) */}
  <div className="block md:hidden divide-y divide-gray-100">
    {productos.map((producto) => (
      <div key={producto.id} className="p-4 flex flex-col gap-4">
        {/* Info principal: Foto, Título, Precio */}
        <div className="flex items-start gap-3">
          <img
            src={producto.imagen_url}
            alt={producto.titulo}
            className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-base line-clamp-2 leading-tight">
              {producto.titulo}
            </p>
            <p className="text-xs font-mono text-gray-400 mt-1">
              ID #{producto.id.substring(0, 8)}...
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-bold text-gray-900 text-base block">
              ${Number(producto.precio).toLocaleString("es-AR")}
            </span>
            <span className="text-xs text-gray-400 block mt-1">
              {new Date(producto.created_at).toLocaleDateString("es-AR")}
            </span>
          </div>
        </div>

        {/* Botones de acción adaptados al pulgar */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          <button
            onClick={() => {
              setEditingProduct(producto);
              setOpenModal(true);
            }}
            className="py-2.5 text-center rounded-xl text-xs font-medium bg-gray-50 text-gray-700 active:bg-gray-100 transition"
          >
            Editar
          </button>

          <button
            onClick={() => handleDelete(producto)}
            className="py-2.5 text-center rounded-xl text-xs font-medium bg-red-50 text-red-600 active:bg-red-100 transition"
          >
            Eliminar
          </button>

          <button
            onClick={() => {
              setProductoVenta(producto);
              setOpenVenta(true);
            }}
            className="py-2.5 text-center rounded-xl text-xs font-medium bg-green-50 text-green-600 active:bg-green-100 transition"
          >
            Vender
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* Estado vacío (Aplica para ambos) */}
  {productos.length === 0 && (
    <div className="py-16 text-center text-gray-400 text-sm">
      No hay productos todavía.
    </div>
  )}
</div>
      {openModal && (
        <ProductModal
          producto={editingProduct}
          onClose={() => setOpenModal(false)}
          onSuccess={fetchProductos}
        />
      )}

      {openVenta && (
  <SaleProductModal
    producto={productoVenta}
    onClose={() => {
      setOpenVenta(false);
      setProductoVenta(null);
    }}
  />
)}
    </>
  );
}
