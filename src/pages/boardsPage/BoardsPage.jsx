import React, { useState } from 'react';
import axios from 'axios';

// Opciones estáticas para los selects
const FAMILIAS = [
  { value: '', label: 'Selecciona una familia' },
  { value: 'FED1', label: 'FED1.0' },
  { value: 'FED2', label: 'FED2.0' },
  { value: 'WL', label: 'WL' },
  { value: 'WSE4', label: 'WSE4' },
  { value: 'PP6', label: 'PARK PILOT' },
  { value: 'BRP', label: 'BRP' },
  { value: 'CLUSTER', label: 'CLUSTER' },
  { value: 'PAD2', label: 'PAD2' },
  { value: 'FPXR', label: 'FPXR' },
  { value: 'LPM', label: 'LPM' },
  { value: 'BK3', label: 'BK3' },
  { value: 'BK4', label: 'BK4' },
];

const LINEAS = [
  { value: '', label: 'Selecciona una línea' },
  { value: 'Linea 1', label: 'Linea 1' },
  { value: 'Linea 2', label: 'Linea 2' },
  { value: 'Linea 3', label: 'Linea 3' },
  { value: 'Linea 4', label: 'Linea 4' },
  { value: 'Linea 5', label: 'Linea 5' },
];

const BoardsPage = () => {
  const [dmc, setDmc] = useState('');
  const [familia, setFamilia] = useState('');
  const [linea, setLinea] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!dmc || !familia || !linea) {
      setMensaje('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    const tarjetaData = { dmc, familia, linea };

    try {
      const response = await axios.post('http://localhost:5000/tarjetas', tarjetaData);

      if (response.data === "Tarjeta perfiladora registrada correctamente") {
        setMensaje('Tarjeta registrada correctamente');
      } else {
        setMensaje('Error al registrar la tarjeta');
      }
    } catch (error) {
      setMensaje('Hubo un error al registrar la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-semibold text-center mb-6">Registrar Tarjeta</h2>
      <form onSubmit={handleSubmit}>
        {/* Campo DMC */}
        <div className="mb-4">
          <label htmlFor="dmc" className="block text-sm font-medium text-gray-700">DMC</label>
          <input
            type="text"
            id="dmc"
            value={dmc}
            onChange={(e) => setDmc(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese DMC"
            required
          />
        </div>

        {/* Campo Familia */}
        <div className="mb-4">
          <label htmlFor="familia" className="block text-sm font-medium text-gray-700">Familia</label>
          <select
            id="familia"
            value={familia}
            onChange={(e) => setFamilia(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          >
            {FAMILIAS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Campo Linea */}
        <div className="mb-4">
          <label htmlFor="linea" className="block text-sm font-medium text-gray-700">Línea</label>
          <select
            id="linea"
            value={linea}
            onChange={(e) => setLinea(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          >
            {LINEAS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Botón Enviar */}
        <button
          type="submit"
          className={`w-full p-2 rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar Tarjeta'}
        </button>
      </form>

      {/* Mensajes de error o éxito */}
      {mensaje && (
        <p className="mt-4 text-center text-sm text-green-600">{mensaje}</p>
      )}
    </div>
  );
};

export default BoardsPage;
