import ProductDetail from "./ProductDetail";
import ShopProvider from "./ShopProvider";

export default function ProductDetailWrapper({ producto }) {
  return (
    <ShopProvider>
      <ProductDetail producto={producto} />
    </ShopProvider>
  );
}