import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RegisterViewPage() {
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTarjetas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/tarjetas");
        setTarjetas(response.data);
      } catch (error) {
        setError("Error al cargar los datos. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchTarjetas();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <section className="p-4 border border-gray-300 shadow-lg rounded-lg bg-white">
        <h2 className="text-lg font-bold text-center mb-4">Registro de tarjetas</h2>

        {/* Mensaje de carga */}
        {loading && <p className="text-center text-gray-600">Cargando tarjetas...</p>}

        {/* Mensaje de error */}
        {error && <p className="text-center text-red-600">{error}</p>}

        {/* Tabla de tarjetas */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow-sm">
              <thead className="bg-gray-200">
                <tr className="text-gray-700 text-sm uppercase">
                  <th className="px-4 py-2 border">DMC</th>
                  <th className="px-4 py-2 border">Familia</th>
                  <th className="px-4 py-2 border">Línea</th>
                  <th className="px-4 py-2 border">Fecha de creación</th>
                  <th className="px-4 py-2 border">Veces usada</th>
                </tr>
              </thead>
              <tbody>
                {tarjetas.length > 0 ? (
                  tarjetas.map((tarjeta) => (
                    <tr key={tarjeta.id} className="hover:bg-gray-50 text-center">
                      <td className="border px-4 py-2">{tarjeta.dmc}</td>
                      <td className="border px-4 py-2">{tarjeta.familia}</td>
                      <td className="border px-4 py-2">{tarjeta.linea}</td>
                      <td className="border px-4 py-2">{tarjeta.fecha_creacion}</td>
                      <td className="border px-4 py-2">{tarjeta.veces_usada}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="border px-4 py-2 text-center text-gray-500">
                      No hay tarjetas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}