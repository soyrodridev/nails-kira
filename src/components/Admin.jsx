import { useState } from "react";

import Sidebar from "./admin/Sidebar";
import Header from "./admin/Header";
import ProductsTable from "./admin/ProductsTable";

export default function Admin() {
  const [section, setSection] = useState("productos");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar
        section={section}
        setSection={setSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-8">
          {section === "productos" && <ProductsTable />}
        </main>
      </div>
    </div>
  );
}