import React, { useState, useEffect } from "react";

export default function RegisterViewPage() {
  const [tarjetas, setTarjetas] = useState([]);

  return (
    <div className="grid grid-cols-3 gap-4 m-4">
      <section className="p-4 col-span-3 border border-gray-300 shadow-lg rounded-lg bg-white">
        <h2 className="font-bold text-center mb-2">Registro de tarjetas</h2>
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">DMC</th>
                <th className="border border-gray-300 px-4 py-2">Familia</th>
                <th className="border border-gray-300 px-4 py-2">Línea</th>
                <th className="border border-gray-300 px-4 py-2">Fecha de creación</th>
                <th className="border border-gray-300 px-4 py-2">Veces usada</th>
              </tr>
            </thead>
            <tbody>
              {tarjetas.map((tarjeta) => (
                <tr key={tarjeta.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{tarjeta.dmc}</td>
                  <td className="border border-gray-300 px-4 py-2">{tarjeta.familia}</td>
                  <td className="border border-gray-300 px-4 py-2">{tarjeta.linea}</td>
                  <td className="border border-gray-300 px-4 py-2">{tarjeta.fecha_creacion}</td>
                  <td className="border border-gray-300 px-4 py-2">{tarjeta.veces_usada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
