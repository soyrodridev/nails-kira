import { useEffect, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { supabaseClient as supabase } from "../lib/supabase";

export default function Admin() {
  const [productos, setProductos] = useState([]);

  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");

  const [imageSrc, setImageSrc] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
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

  // ================= IMAGE =================
  const onSelectFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  // ================= CROPPER =================
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const applyCrop = async () => {
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);

    const file = new File([blob], `${Date.now()}.webp`, {
      type: "image/webp",
    });

    setCroppedFile(file);
    setPreview(URL.createObjectURL(blob));
    setImageSrc(null);
  };

  // ================= UPLOAD =================
  const uploadImage = async () => {
    if (!croppedFile) return null;

    const fileName = `${Date.now()}.webp`;

    const { error } = await supabase.storage
      .from("productos")
      .upload(fileName, croppedFile);

    if (error) return null;

    const { data } = supabase.storage
      .from("productos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const imageUrl = await uploadImage();

    if (editandoId) {
      const updateData = { titulo, precio };
      if (imageUrl) updateData.imagen_url = imageUrl;

      await supabase
        .from("productos")
        .update(updateData)
        .eq("id", editandoId);
    } else {
      await supabase
        .from("productos")
        .insert([{ titulo, precio, imagen_url: imageUrl }]);
    }

    setTitulo("");
    setPrecio("");
    setCroppedFile(null);
    setPreview(null);
    setEditandoId(null);

    fetchProductos();
    setLoading(false);
  };

  // ================= DELETE =================
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
    "/storage/v1/object/public/productos/"
  )[1];

  if (filePath) {
    const { error } = await supabase.storage
      .from("productos")
      .remove([filePath]);

    if (error) {
      console.log("Error eliminando imagen:", error);
    }
  }
}

    await supabase.from("productos").delete().eq("id", id);
    fetchProductos();
  };

  // ================= EDIT =================
  const handleEdit = (p) => {
    setTitulo(p.titulo);
    setPrecio(p.precio);
    setEditandoId(p.id);
    setPreview(p.imagen_url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-pink-50 p-6 md:p-10">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          Panel Admin 💅
        </h1>
        <p className="text-gray-500">
          Gestión de productos de uñas
        </p>
      </div>

      {/* ================= CROPPER ================= */}
      {imageSrc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-[360px]">

            <div className="relative w-full h-[320px] bg-black rounded-xl overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setImageSrc(null)}
                className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                onClick={applyCrop}
                className="flex-1 py-2 rounded-xl bg-fuchsia-500 text-white hover:bg-fuchsia-600"
              >
                Aplicar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl rounded-3xl p-6 md:p-10 space-y-5"
      >
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nombre del producto"
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100 outline-none"
        />

        <input
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Precio"
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-100 outline-none"
        />

        <label className="cursor-pointer block border-2 border-dashed border-gray-300 hover:border-fuchsia-400 rounded-2xl p-6 text-center bg-gray-50 hover:bg-fuchsia-50 transition">
          <input type="file" onChange={onSelectFile} className="hidden" />

          <p className="text-gray-600 font-medium">
            📸 Subir imagen del producto
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Click para seleccionar y recortar
          </p>
        </label>

        {preview && (
          <div className="flex justify-center">
            <img
              src={preview}
              className="w-40 h-40 object-cover rounded-2xl shadow"
            />
          </div>
        )}

        <button
          disabled={loading}
          className="w-full h-12 bg-fuchsia-500 text-white rounded-2xl font-semibold hover:bg-fuchsia-600 transition"
        >
          {editandoId ? "Actualizar" : "Guardar"}
        </button>
      </form>

      {/* ================= LIST ================= */}
      <div className="max-w-6xl mx-auto mt-12 grid gap-4">
        {productos.map((p) => (
          <div
            key={p.id}
            className="bg-white border border-gray-100 shadow-md rounded-2xl p-4 flex items-center justify-between hover:shadow-xl transition"
          >

            {/* LEFT */}
            <div className="flex items-center gap-4">
              <img
                src={p.imagen_url}
                className="w-16 h-16 rounded-xl object-cover border"
              />

              <div>
                <p className="font-semibold text-gray-800">{p.titulo}</p>
                <p className="text-sm text-gray-500">
                  ${Number(p.precio).toLocaleString("es-AR")}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(p)}
                className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(p.id)}
                className="px-3 py-1 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
              >
                Eliminar
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}