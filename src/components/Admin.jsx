import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../lib/supabase";

export default function Admin() {
  const [productos, setProductos] = useState([]);

  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH
  // =========================
  const fetchProductos = async () => {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });

    setProductos(data || []);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // =========================
  // IMAGE PREVIEW
  // =========================
  const handleImage = (file) => {
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  // =========================
  // UPLOAD
  // =========================
  const uploadImage = async () => {
    if (!imagen) return null;

    const fileName = Date.now() + "-" + imagen.name;

    const { error } = await supabase.storage
      .from("productos")
      .upload(fileName, imagen);

    if (error) return null;

    const { data } = supabase.storage.from("productos").getPublicUrl(fileName);

    return data.publicUrl;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const imageUrl = await uploadImage();

    if (editandoId) {
      const updateData = { titulo, precio };
      if (imageUrl) updateData.imagen_url = imageUrl;

      await supabase.from("productos").update(updateData).eq("id", editandoId);
    } else {
      await supabase
        .from("productos")
        .insert([{ titulo, precio, imagen_url: imageUrl }]);
    }

    setTitulo("");
    setPrecio("");
    setImagen(null);
    setPreview(null);
    setEditandoId(null);

    fetchProductos();
    setLoading(false);
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (p) => {
    setTitulo(p.titulo);
    setPrecio(p.precio);
    setEditandoId(p.id);
    setPreview(p.imagen_url);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const ok = confirm("¿Eliminar producto?");
    if (!ok) return;

    const { data } = await supabase
      .from("productos")
      .select("imagen_url")
      .eq("id", id)
      .single();

    if (data?.imagen_url) {
      const filePath = data.imagen_url.split(
        "/storage/v1/object/public/productos/",
      )[1];

      await supabase.storage.from("productos").remove([filePath]);
    }

    await supabase.from("productos").delete().eq("id", id);
    fetchProductos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F7FB] to-[#F3E8FF] p-6">
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Panel Admin 📦</h1>

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-xl p-6 md:p-8 flex flex-col gap-6"
      >
        {/* TITLE */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Título del producto
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Uñas press on elegantes"
            required
            className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 outline-none transition"
          />
        </div>

        {/* PRICE */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Precio</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Ej: 5000"
            required
            className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 outline-none transition"
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Imagen del producto
          </label>

          <label className="group cursor-pointer border-2 border-dashed border-gray-300 hover:border-fuchsia-400 transition rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-fuchsia-50">
            <div className="flex items-center justify-center">
              {/* SVG (NO MODIFICADO) */}
              {!preview && (
                <div
                  className="icon group-hover:scale-105 transition"
                  id="icon-upload"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill=""
                    viewBox="0 0 24 24"
                  >
                    <g strokeWidth="0"></g>
                    <g strokeLinejoin="round" strokeLinecap="round"></g>
                    <g>
                      <path
                        fill=""
                        d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                        clipRule="evenodd"
                        fillRule="evenodd"
                      ></path>
                    </g>
                  </svg>
                </div>
              )}

              {preview && (
                <img
                  src={preview}
                  className="w-32 h-32 object-cover rounded-2xl shadow-md"
                />
              )}
            </div>

            <span className="text-sm text-gray-600">
              Click para subir una imagen
            </span>

            <input
              type="file"
              onChange={(e) => handleImage(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="h-12 cursor-pointer rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition"
        >
          {editandoId ? "Actualizar producto" : "Guardar producto"}
        </button>
      </form>

      {/* LISTA */}
      <div className="grid grid-cols-1 gap-4 mt-10">
        {productos.map((p, index) => (
          <div
            key={p.id}
            className="bg-white space-y-3 p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2"
          >
            {/* LEFT */}
            <div className="flex items-center space-x-2">
              <picture>
                <img src={p.imagen_url} alt={p.titulo} className="w-20" />
              </picture>

              <div>
                {/* META */}
                <div className="flex items-center space-x-2 text-sm">
                  <div>
                    <span className="text-blue-500 font-bold hover:underline">
                      #{String(index + 1).padStart(4, "0")}
                    </span>
                  </div>

                  <div className="text-gray-500">
                    {new Date(p.created_at).toLocaleDateString("es-AR")}
                  </div>

                  <div>
                    <span className="p-1.5 text-xs font-medium uppercase tracking-wider text-green-800 bg-green-200 rounded-lg bg-opacity-50">
                      Disponible
                    </span>
                  </div>
                </div>

                {/* TITLE */}
                <div className="text-sm text-gray-700">{p.titulo}</div>

                {/* PRICE */}
                <div className="text-sm font-medium text-black">
                  $ {Number(p.precio).toLocaleString("es-AR")}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex w-full md:justify-end md:items-center space-x-4">
              {/* EDIT BUTTON (SVG intacto) */}
              <button
                onClick={() => handleEdit(p)}
                className="p-1.5 text-[1rem] font-medium uppercase flex justify-center items-center cursor-pointer tracking-wider text-green-800 bg-green-200 rounded-lg bg-opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-edit"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                  <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" />
                  <path d="M16 5l3 3" />
                </svg>
                Editar
              </button>

              {/* DELETE BUTTON (SVG intacto) */}
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 text-[1rem] flex justify-center items-center cursor-pointer space-x-4 font-medium uppercase tracking-wider text-red-800 bg-red-200 rounded-lg bg-opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-file-x"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />
                  <path d="M10 12l4 4m0 -4l-4 4" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
