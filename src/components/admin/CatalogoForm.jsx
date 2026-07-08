import { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
import { supabaseClient as supabase } from "../../lib/supabase";

export default function CatalogoForm({ onSuccess }) {
  const [modo, setModo] = useState("nuevo");
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(false);

  const [imageSrc, setImageSrc] = useState(null);
  const [preview, setPreview] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const fetchInventario = async () => {
      const { data } = await supabase.from("productos").select("id, titulo");
      setInventario(data || []);
    };
    fetchInventario();
  }, []);

  const onSelectFile = (e) => {
    const file = e.target.files[0];
    if (file) setImageSrc(URL.createObjectURL(file));
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const applyCrop = async () => {
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    const file = new File([blob], `${Date.now()}.webp`, { type: "image/webp" });
    setCroppedFile(file);
    setPreview(URL.createObjectURL(blob));
    setImageSrc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      const { data: sesion } = await supabase
        .from("sesiones")
        .select("id")
        .eq("estado", "activa")
        .single();

      if (!sesion) throw new Error("No hay una sesión activa.");

      let finalProductoId = formData.get("producto_id");

      if (modo === "nuevo") {
        if (!croppedFile) throw new Error("Por favor, selecciona y recorta una imagen.");
        
        const fileName = `${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("productos")
          .upload(fileName, croppedFile);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("productos").getPublicUrl(fileName);

        const { data: nuevoP, error: insertError } = await supabase
          .from("productos")
          .insert({ 
            titulo: formData.get("titulo"), 
            precio: formData.get("precio_venta"),
            imagen_url: publicUrl 
          })
          .select().single();
        
        if (insertError) throw insertError;
        finalProductoId = nuevoP.id;
      }

      const { error: posError } = await supabase.from("catalogo_pos").insert({
        producto_id: finalProductoId,
        precio_venta: formData.get("precio_venta"),
        sesion_id: sesion.id
      });

      if (posError) throw posError;
      onSuccess();
      window.location.reload();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none transition-all";

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto">
      {/* Editor de imagen overlay */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 bg-black p-4 flex flex-col">
          <div className="relative flex-1">
            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
          </div>
          <button type="button" onClick={applyCrop} className="mt-4 py-4 bg-pink-600 text-white rounded-2xl font-bold text-lg">
            Recortar y Guardar
          </button>
        </div>
      )}

      <h2 className="text-xl font-bold mb-6 text-gray-800">Agregar producto al Kiosco</h2>
      
      <div className="bg-gray-100 p-1.5 rounded-2xl flex flex-wrap gap-1 mb-8">
        <button type="button" onClick={() => setModo("nuevo")} className={`flex-1 min-w-[120px] py-3 rounded-xl font-bold transition-all ${modo === 'nuevo' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>Crear Nuevo</button>
        <button type="button" onClick={() => setModo("existente")} className={`flex-1 min-w-[120px] py-3 rounded-xl font-bold transition-all ${modo === 'existente' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>Del Inventario</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {modo === "nuevo" ? (
          <div className="space-y-4">
            <input name="titulo" placeholder="Nombre del producto" className={inputClass} required />
            
            <div className="space-y-2">
              <label className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${preview ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300 bg-gray-50'}`}>
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover rounded-[22px]" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm text-gray-500 font-bold">Seleccionar imagen</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={onSelectFile} accept="image/*" />
              </label>
            </div>
          </div>
        ) : (
          <select name="producto_id" className={inputClass} required>
            <option value="">Selecciona un producto...</option>
            {inventario.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
          </select>
        )}
        
        <input name="precio_venta" type="number" placeholder="Precio de venta en Kiosco ($)" className={inputClass} required />
        
        <button disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50">
          {loading ? "Procesando..." : "Publicar en Catálogo"}
        </button>
      </form>
    </div>
  );
}