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
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-xl">Productos</h3>

            <p className="text-sm text-gray-500">Gestiona tu catálogo</p>
          </div>

          <button
            onClick={() => {
              setEditingProduct(null);
              setOpenModal(true);
            }}
            className="bg-purple-50 text-black hover:bg-purple-600 hover:text-white cursor-pointer px-4 py-2 rounded-2xl"
          >
            + Nuevo producto
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-500">
                  Producto
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-500">
                  Precio
                </th>

                <th className="text-left px-6 py-4 text-sm text-gray-500">
                  Fecha
                </th>

                <th className="text-right px-6 py-4 text-sm text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr
                  key={producto.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={producto.imagen_url}
                        alt={producto.titulo}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />

                      <div>
                        <p className="font-semibold text-gray-800">
                          {producto.titulo}
                        </p>

                        <p className="text-sm text-gray-500">
                          ID #{producto.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-medium">
                    ${Number(producto.precio).toLocaleString("es-AR")}
                  </td>

                  <td className="px-6 py-4 text-gray-500">
                    {new Date(producto.created_at).toLocaleDateString("es-AR")}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(producto);
                          setOpenModal(true);
                        }}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDelete(producto)}
                        className="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => {
                          setProductoVenta(producto);
                          setOpenVenta(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        Vender
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {productos.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-gray-400">
                    No hay productos todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
