import React from "react";

function Container({ children }) {
  return (
    <section className="max-w-6xl m-auto px-4">
      {children}
    </section>
  );
}

export default Container;