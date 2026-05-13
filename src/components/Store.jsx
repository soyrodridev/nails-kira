import { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";

import Welcome from "./Welcome";
import ProductsGrid from "./ProductsGrid";
import Container from "./Container";

export default function Store({ productos = [] }) {

  const { search, addToCart } = useContext(ShopContext);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) =>
      p.titulo.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, productos]);

  return (
    <>
      <Welcome />

      <Container>
        <ProductsGrid
          productos={productosFiltrados}
          addToCart={addToCart}
        />
      </Container>
    </>
  );
}