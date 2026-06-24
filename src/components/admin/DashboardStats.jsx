import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    productos: 0,
    ingresos: 0,
    gastos: 0,
    balance: 0,
  });

  const [grafico, setGrafico] = useState([]);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    // PRODUCTOS
    const { count: totalProductos } = await supabase
      .from("productos")
      .select("*", { count: "exact", head: true });

    // MOVIMIENTOS
    const { data: movimientos } = await supabase
      .from("movimientos")
      .select("*")
      .order("created_at", { ascending: true });

    let ingresos = 0;
    let gastos = 0;
    let balanceAcumulado = 0;

    const datosGrafico = [];

    movimientos?.forEach((mov) => {
      const monto = Number(mov.monto);

      if (mov.tipo === "ingreso") {
        ingresos += monto;
        balanceAcumulado += monto;
      } else {
        gastos += monto;
        balanceAcumulado -= monto;
      }

      datosGrafico.push({
        fecha: new Date(mov.created_at).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
        }),
        balance: balanceAcumulado,
      });
    });

    setStats({
      productos: totalProductos || 0,
      ingresos,
      gastos,
      balance: ingresos - gastos,
    });

    setGrafico(datosGrafico);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <Card
          titulo="Productos"
          valor={stats.productos}
        />

        <Card
          titulo="Ingresos"
          valor={`$${stats.ingresos.toLocaleString("es-AR")}`}
        />

        <Card
          titulo="Gastos"
          valor={`$${stats.gastos.toLocaleString("es-AR")}`}
        />

        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">
            Balance Total
          </p>

          <h2
            className={`text-3xl md:text-4xl font-bold mt-2 md:mt-3 ${
              stats.balance >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {stats.balance >= 0 ? "+" : "-"}$
            {Math.abs(stats.balance).toLocaleString("es-AR")}
          </h2>
        </div>
      </div>

      {/* GRÁFICO */}
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800">
            Evolución financiera
          </h3>

          <p className="text-sm text-gray-500">
            Ganancias y pérdidas acumuladas
          </p>
        </div>

        {/* Ajuste de altura dinámica para que no ocupe toda la pantalla del celular */}
        <div className="h-[250px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={grafico}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              {/* Cuadrícula más sutil */}
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              {/* minTickGap evita que se encimen las fechas en horizontal */}
              <XAxis 
                dataKey="fecha" 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                dy={10}
              />

              <YAxis 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                dx={5}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #f3f4f6',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value) =>
                  `$${Number(value).toLocaleString("es-AR")}`
                }
              />

              <Line
                type="monotone"
                dataKey="balance"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                stroke={
                  stats.balance >= 0
                    ? "#16a34a"
                    : "#dc2626"
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ titulo, valor }) {
  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm">
      <p className="text-sm text-gray-500">
        {titulo}
      </p>

      <h2 className="text-3xl md:text-4xl font-bold mt-2 md:mt-3 text-gray-800">
        {valor}
      </h2>
    </div>
  );
}