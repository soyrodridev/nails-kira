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
      {search === "" && <Welcome />}

      <Container>
        {productosFiltrados.length > 0 ? (
          <ProductsGrid
            productos={productosFiltrados}
            addToCart={addToCart}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-xl font-medium text-gray-600">
              No se encontraron productos para "{search}"
            </h2>
            <p className="text-gray-400 mt-2">
              Intenta con otros términos de búsqueda.
            </p>
          </div>
        )}
      </Container>
    </>
  );
}