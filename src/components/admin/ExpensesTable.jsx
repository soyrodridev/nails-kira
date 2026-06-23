import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "../../lib/supabase";
import ExpenseModal from "./ExpenseModal";

export default function ExpensesTable() {

  const [gastos,setGastos]=useState([]);
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    fetchGastos();
  },[]);

  const fetchGastos=async()=>{
    const {data}=await supabase
      .from("gastos")
      .select("*")
      .order("created_at",{ascending:false});

    setGastos(data||[]);
  }

  return(
    <div className="bg-white rounded-3xl p-6">

      <div className="flex justify-between mb-6">

        <h2 className="text-2xl font-bold">
          Gastos
        </h2>

        <button
          onClick={()=>setOpen(true)}
          className="bg-red-500 text-white px-5 py-3 rounded-xl"
        >
          Nuevo gasto
        </button>

      </div>

      {gastos.map(g=>(
        <div
          key={g.id}
          className="border-b py-4 flex justify-between"
        >
          <div>
            <h3>{g.concepto}</h3>
            <p>{g.categoria}</p>
          </div>

          <strong>
            $
            {Number(g.monto)
            .toLocaleString("es-AR")}
          </strong>
        </div>
      ))}

      {open &&
        <ExpenseModal
          onClose={()=>{
            setOpen(false);
            fetchGastos();
          }}
        />
      }

    </div>
  )
}