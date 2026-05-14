import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropImage";
import imageCompression from "browser-image-compression";

export default function ImageCropper({ onClose, onSave }) {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
  };

  const handleSave = async () => {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);

    const compressed = await imageCompression(croppedImage, {
      maxSizeMB: 0.3,
      fileType: "image/webp",
    });

    onSave(compressed);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-lg p-4 rounded-2xl">

        {!image ? (
          <input type="file" accept="image/*" onChange={handleFile} />
        ) : (
          <>
            <div className="relative w-full h-80 bg-gray-200">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={onClose}>Cancelar</button>
              <button onClick={handleSave}>Guardar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}