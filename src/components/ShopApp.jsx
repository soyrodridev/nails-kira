import ShopProvider from "./ShopProvider";

export default function ShopApp({ children }) {
  return (
    <ShopProvider>
      {children}
    </ShopProvider>
  );
}