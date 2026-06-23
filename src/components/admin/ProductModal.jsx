import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function ProductModal({
  onClose,
  onSuccess,
  producto = null,
}) {
  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");

  const [imageSrc, setImageSrc] = useState(null);
  const [preview, setPreview] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (producto) {
      setTitulo(producto.titulo);
      setPrecio(producto.precio);
      setPreview(producto.imagen_url);
    }
  }, [producto]);

  // ====================
  // SELECCIONAR IMAGEN
  // ====================

  const onSelectFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImageSrc(URL.createObjectURL(file));
  };

  // ====================
  // CROPPER
  // ====================

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const applyCrop = async () => {
    const blob = await getCroppedImg(
      imageSrc,
      croppedAreaPixels
    );

    const file = new File(
      [blob],
      `${Date.now()}.webp`,
      {
        type: "image/webp",
      }
    );

    setCroppedFile(file);
    setPreview(URL.createObjectURL(blob));

    setImageSrc(null);
  };

  // ====================
  // SUBIR IMAGEN
  // ====================

  const uploadImage = async () => {
    if (!croppedFile) return preview;

    const fileName = `${Date.now()}.webp`;

    const { error } = await supabase.storage
      .from("productos")
      .upload(fileName, croppedFile);

    if (error) {
      console.log(error);
      return null;
    }

    const { data } = supabase.storage
      .from("productos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // ====================
  // GUARDAR
  // ====================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const imageUrl = await uploadImage();

    if (producto) {
      await supabase
        .from("productos")
        .update({
          titulo,
          precio,
          imagen_url: imageUrl,
        })
        .eq("id", producto.id);
    } else {
      await supabase.from("productos").insert([
        {
          titulo,
          precio,
          imagen_url: imageUrl,
        },
      ]);
    }

    setLoading(false);

    onSuccess();
    onClose();
  };

  return (
    <>
      {/* CROP MODAL */}

      {imageSrc && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl p-5 w-full max-w-md">

            <h3 className="font-bold text-xl mb-4">
              Recortar imagen
            </h3>

            <div className="relative w-full h-[350px] rounded-2xl overflow-hidden">
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

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setImageSrc(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={applyCrop}
                className="flex-1 py-3 rounded-2xl bg-fuchsia-500 text-white"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINCIPAL */}

      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">

        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl">

          {/* HEADER */}

          <div className="p-6 border-b flex justify-between items-center">

            <div>
              <h2 className="text-2xl font-bold">
                {producto
                  ? "Editar producto"
                  : "Nuevo producto"}
              </h2>

              <p className="text-gray-500">
                Gestiona tu catálogo
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5"
          >
            <div>
              <label className="block mb-2 text-sm font-medium">
                Nombre
              </label>

              <input
                type="text"
                required
                value={titulo}
                onChange={(e) =>
                  setTitulo(e.target.value)
                }
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-fuchsia-100 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Precio
              </label>

              <input
                type="number"
                required
                value={precio}
                onChange={(e) =>
                  setPrecio(e.target.value)
                }
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-fuchsia-100 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Imagen
              </label>

              <label className="cursor-pointer block border-2 border-dashed rounded-2xl p-6 text-center hover:bg-fuchsia-50">

                <input
                  type="file"
                  className="hidden"
                  onChange={onSelectFile}
                />

                {!preview ? (
                  <>
                    <p className="text-4xl">📸</p>

                    <p className="mt-2 text-gray-600">
                      Seleccionar imagen
                    </p>
                  </>
                ) : (
                  <img
                    src={preview}
                    className="mx-auto w-40 h-40 rounded-2xl object-cover"
                  />
                )}
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl border"
              >
                Cancelar
              </button>

              <button
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white"
              >
                {loading
                  ? "Guardando..."
                  : producto
                  ? "Actualizar"
                  : "Guardar"}
              </button>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}