import ShopProvider from "./ShopProvider";
import Header from "./Header";
import Store from "./Store";
import ProductDetail from "./ProductDetail";
import CheckoutPage from "./CheckoutPage";


export default function App({ productos, productoDetalle, isCheckout }) {
  return (
    <ShopProvider>
      {/* El Header siempre está presente y conectado al carrito */}
      <Header />

      <main>
        {/* 
          Cambiamos la lógica para evitar el uso de 'children' desde Astro.
          Esto asegura que el Context API funcione en todas las vistas.
        */}
        {isCheckout ? (
          <CheckoutPage />
        ) : productoDetalle ? (
          <ProductDetail producto={productoDetalle} />
        ) : (
          <Store productos={productos} />
        )}
      </main>
    </ShopProvider>
  );
}