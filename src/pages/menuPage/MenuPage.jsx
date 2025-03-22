import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";

// Registra los elementos necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const MenuPage = () => {
  const [tarjetas, setTarjetas] = useState([]);
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState('');
  const [familias, setFamilias] = useState([]);  // Estado para almacenar las familias obtenidas
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Usos por Tarjeta',
        data: [],
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  });

  // Función para obtener los datos de las tarjetas
  const fetchTarjetas = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3000/tarjetas");
      setTarjetas(response.data);
    } catch (error) {
      console.error("Error al obtener los datos de las tarjetas:", error);
    }
  }, []);

  // Función para obtener los datos de las familias
  const fetchFamilias = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3000/familias");
      // Asegurarse de que los datos son los esperados
      const familiasData = response.data.map(familia => ({
        value: familia.id,  // Puedes usar el id o cualquier otro valor único
        label: familia.nombre, // Muestra el nombre de la familia
      }));
      setFamilias(familiasData);  // Actualizar el estado con los datos de familias
    } catch (error) {
      console.error("Error al obtener las familias:", error);
    }
  }, []);

  // Cargar las tarjetas y familias cuando el componente se monta
  useEffect(() => {
    fetchTarjetas();
    fetchFamilias();
  }, [fetchTarjetas, fetchFamilias]);

  // Filtrar las tarjetas por la familia seleccionada
  useEffect(() => {
    const filteredTarjetas = familiaSeleccionada
      ? tarjetas.filter((tarjeta) => tarjeta.familia === familiaSeleccionada)
      : tarjetas;

    const labels = filteredTarjetas.map((tarjeta) => tarjeta.dmc);
    const data = filteredTarjetas.map((tarjeta) => tarjeta.veces_usada);

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Usos por Tarjeta',
          data: data,
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
      ],
    });
  }, [familiaSeleccionada, tarjetas]);

  const handleFamiliaChange = (event) => {
    setFamiliaSeleccionada(event.target.value);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen p-4 bg-gray-50">
      <div className="w-full max-w-lg mb-6">
        <FormControl fullWidth>
          <InputLabel id="familia-select-label">Selecciona una familia</InputLabel>
          <Select
            labelId="familia-select-label"
            value={familiaSeleccionada}
            onChange={handleFamiliaChange}
            label="Selecciona una familia"
            variant="outlined"
            className="border border-gray-300 rounded-lg"
          >
            {familias.map((familia) => (
              <MenuItem key={familia.value} value={familia.value}>
                {familia.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="w-full max-w-4xl">
        <Line data={chartData} options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Usos por Tarjeta',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'DMC',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Usos',
              },
              min: 0,
            },
          },
        }} />
      </div>
    </div>
  );
};

export default MenuPage;
