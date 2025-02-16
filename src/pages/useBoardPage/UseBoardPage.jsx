import React, { useState } from "react";
import { buscarTarjeta, usarTarjeta } from "../../funciones/Funciones"; // Importar las funciones desde el archivo separado

export default function UseBoardPage() {
  const [dmc, setDmc] = useState(""); // DMC ingresado por el usuario
  const [tarjeta, setTarjeta] = useState(null); // Tarjeta obtenida de la base de datos

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text_2xl font-bold text-center text-gray-700 mb-4">
        Usar tarjeta perfiladora
      </h1>
      <section className="mb-6">
        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="dmc" className="text-gray-600 font-medium">Ingresar DMC:</label>
          <input
            id="dmc"
            type="text"
            value={dmc}
            onChange={(e) => setDmc(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Escribe el DMC"
          />
        </div>
        <button
          onClick={() => buscarTarjeta(dmc, setTarjeta)} // Mandar a llamar la función buscarTarjeta
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Buscar
        </button>
      </section>

      {tarjeta && (
        <section className="mb-6">
          {[{ label: "Fecha de creación", value: tarjeta.fecha_creacion },
            { label: "Creador", value: tarjeta.creador },
            { label: "Familia", value: tarjeta.familia },
            { label: "Veces usada", value: tarjeta.veces_usada },
            { label: "Estado", value: tarjeta.estado },
          ].map((field, index) => (
            <div className="flex flex-col gap-2 mb-4" key={index}>
              <label className="text-gray-600 font-medium">{field.label}</label>
              <input
                type="text"
                value={field.value}
                disabled
                className="border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          ))}
        </section>
      )}

      <div className="flex justify-end gap-4">
        <button
          onClick={() => usarTarjeta(tarjeta, setTarjeta)} // Mandar a llamar la función usarTarjeta
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
        >
          Usar
        </button>
        <button
          onClick={() => setTarjeta(null)} // Limpiar el estado de tarjeta
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
