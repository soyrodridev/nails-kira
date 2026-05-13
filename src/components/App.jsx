import ShopProvider from "./ShopProvider";
import Store from "./Store";

export default function App({ productos }) {
  return (
    <ShopProvider>
      <Store productos={productos} />
    </ShopProvider>
  );
}