import ShopProvider from "./ShopProvider";
import Header from "./Header";
import Store from "./Store";
import ProductDetail from "./ProductDetail";
import CheckoutPage from "./CheckoutPage";


export default function App({ productos, productoDetalle, isCheckout }) {
  return (
    <ShopProvider>
      <Header />

      <main>
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