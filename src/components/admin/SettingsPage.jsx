import { useState } from "react";

export default function SettingsPage(){

  const [nombre,setNombre]=useState("");
  const [whatsapp,setWhatsapp]=useState("");
  const [instagram,setInstagram]=useState("");

  return(
    <div className="bg-white rounded-3xl p-8 max-w-3xl">

      <h2 className="text-3xl font-bold mb-6">
        Configuración
      </h2>

      <div className="space-y-5">

        <input
          placeholder="Nombre del negocio"
          className="w-full border p-3 rounded-xl"
          value={nombre}
          onChange={(e)=>setNombre(e.target.value)}
        />

        <input
          placeholder="WhatsApp"
          className="w-full border p-3 rounded-xl"
          value={whatsapp}
          onChange={(e)=>setWhatsapp(e.target.value)}
        />

        <input
          placeholder="Instagram"
          className="w-full border p-3 rounded-xl"
          value={instagram}
          onChange={(e)=>setInstagram(e.target.value)}
        />

        <button className="bg-fuchsia-500 text-white px-6 py-3 rounded-xl">
          Guardar cambios
        </button>

      </div>

    </div>
  )
}