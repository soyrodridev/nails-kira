// App.jsx
import ShopProvider from "./ShopProvider";
import Header from "./Header";
import Store from "./Store";
import ProductDetail from "./ProductDetail";

export default function App({ productos, productoDetalle }) {
  return (
    <ShopProvider>
      <Header />
      
      {productoDetalle ? (
        <ProductDetail producto={productoDetalle} />
      ) : (
        <Store productos={productos} />
      )}
      
    </ShopProvider>
  );
}