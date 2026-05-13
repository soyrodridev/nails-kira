import { createContext } from "react";

export const ShopContext = createContext({
  search: "",
  setSearch: () => {},
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  increaseQuantity: () => {},
  decreaseQuantity: () => {}
});