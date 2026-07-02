import { MercadoPagoConfig, Qr } from "mercadopago";
import { supabaseAdmin as supabase } from "../../lib/supabaseAdmin";

// Configuramos el cliente con tu Access Token
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
const client = new MercadoPagoConfig({ accessToken: accessToken || "" });

export async function POST({ request }) {
  try {
    const { catalogoId } = await request.json();

    // 1. Obtener datos del producto desde la base de datos
    const { data: item, error } = await supabase
      .from("catalogo_pos")
      .select(`precio_venta, productos (titulo)`)
      .eq("id", catalogoId)
      .single();

    if (error || !item) throw new Error("Producto no encontrado");

    // 2. Instanciamos la clase Qr de Mercado Pago
    const qrClient = new Qr(client);
    
    // 3. Crear el QR de Punto de Venta
    // NOTA: Debes reemplazar 'CAJA_01' por el ID de la caja que creaste en tu panel de MP
    const response = await qrClient.create({
      userId: process.env.MERCADOPAGO_USER_ID, // ID de tu cuenta de vendedor
      externalPosId: "CAJA_01", 
      body: {
        external_reference: catalogoId,
        title: item.productos.titulo,
        total_amount: Number(item.precio_venta),
        items: [{
          title: item.productos.titulo,
          unit_price: Number(item.precio_venta),
          quantity: 1,
          unit_measure: "unit"
        }]
      }
    });

    // 4. Retornamos el string del QR (qr_data)
    // Este string es el que debes pasar a una librería como 'qrcode.react' 
    // en tu frontend para generar la imagen visual.
    return new Response(JSON.stringify({ qr_data: response.qr_data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error al generar QR:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}