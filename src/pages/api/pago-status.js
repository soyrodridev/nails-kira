export async function GET({ url }) {
  const catalogoId = url.searchParams.get("id");
  
  if (!catalogoId) return new Response(JSON.stringify({ pagado: false }), { status: 400 });

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${catalogoId}&sort=date_created&criteria=desc`, {
      headers: { "Authorization": `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
    });
    
    const data = await response.json();
    
    // Buscamos si hay algún pago aprobado para este catalogoId
    const pagado = data.results?.some(p => p.status === 'approved');
    
    return new Response(JSON.stringify({ pagado }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ pagado: false }), { status: 500 });
  }
}