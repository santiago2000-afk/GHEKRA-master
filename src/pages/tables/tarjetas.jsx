import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const Tarjetas = () => {
    const [data, setData] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [formData, setFormData] = useState({ dmc: "", familia: "", linea: "", veces_usada: 0, fecha_creacion: "" });
    const [currentItem, setCurrentItem] = useState(null);

    // Obtener datos del endpoint
    const fetchData = () => {
        fetch("http://localhost:3000/tarjetas")
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error("Error al obtener tarjetas:", error));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (type, item = null) => {
        setModalType(type);
        setCurrentItem(item);
        setModalIsOpen(true);
        if (item) {
            setFormData({ dmc: item.dmc, familia: item.familia, linea: item.linea, veces_usada: item.veces_usada, fecha_creacion: item.fecha_creacion });
        } else {
            setFormData({ dmc: "", familia: "", linea: "", veces_usada: 0, fecha_creacion: "" });
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setFormData({ dmc: "", familia: "", linea: "", veces_usada: 0, fecha_creacion: "" });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        return formData.dmc.trim() !== ""; // Validación básica
    };

    const handleSubmit = () => {

        if (!validateForm()) {
            console.error("El campo 'dmc' es obligatorio");
            return;
        }

        const newItem = { 
            dmc: formData.dmc,
            familia: formData.familia,
            linea: formData.linea,
            veces_usada: 0,
            fecha_creacion: formData.fecha_creacion || new Date().toISOString() // Ensure 'fecha_creacion' is included
        };

        // Agregar nueva tarjeta
        if (modalType === "add") {
            fetch("http://localhost:3000/tarjetas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem),
            })
                .then((response) => response.text())
                .then((text) => {
                    console.log("Respuesta del servidor:", text);
                    fetchData();  // Recargar los datos
                    closeModal();
                })
                .catch((error) => console.error("Error al agregar tarjeta:", error));
        }

        // Actualizar tarjeta existente
        else if (modalType === "edit" && currentItem) {
            const updatedItem = { dmc: formData.dmc, familia: formData.familia, linea: formData.linea, veces_usada: currentItem.veces_usada };

            fetch(`http://localhost:3000/tarjetas/${currentItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedItem),
            })
                .then((response) => response.text())
                .then((text) => {
                    console.log("Respuesta del servidor:", text);
                    fetchData();  // Recargar los datos
                    closeModal();
                })
                .catch((error) => console.error("Error al actualizar tarjeta:", error));
        }
    };

    const handleDelete = (id) => {
        // Confirmación antes de eliminar
        if (window.confirm("¿Estás seguro de que deseas eliminar esta tarjeta?")) {
            // Enviar solicitud DELETE para eliminar la familia
            fetch(`http://localhost:3000/tarjetas/${id}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Error al eliminar tarjeta: ${response.statusText}`);
                    }
                    return response.text();  // Obtener la respuesta como texto plano
                })
                .then((text) => {
                    console.log("Respuesta del servidor:", text);  // Mensaje de éxito o error
                    fetchData();  // Recargar los datos después de eliminar el ítem
                })
                .catch((error) => {
                    console.error("Error al eliminar tarjeta:", error);
                });
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-end mb-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => openModal("add")}
                >
                    Agregar
                </button>
            </div>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">DMC</th>
                        <th className="border border-gray-300 px-4 py-2">Familia</th>
                        <th className="border border-gray-300 px-4 py-2">Linea</th>
                        <th className="border border-gray-300 px-4 py-2">Veces Usadas</th>
                        <th className="border border-gray-300 px-4 py-2">Fecha de creacion</th>
                        <th className="border border-gray-300 px-4 py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td className="border border-gray-300 px-4 py-2">{item.dmc}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.familia}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.linea}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.veces_usada}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.fecha_creacion}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <button
                                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                    onClick={() => openModal("edit", item)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <h2 className="text-xl font-bold mb-4">
                    {modalType === "add" ? "Agregar Tarjeta" : "Editar Tarjeta"}
                </h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">DMC</label>
                        <input
                            type="text"
                            name="dmc"
                            value={formData.dmc}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-4 py-2 rounded"
                        />
                        <label className="block text-gray-700 mb-2">Familia</label>
                        <input
                            type="text"
                            name="familia"
                            value={formData.familia}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-4 py-2 rounded"
                        />
                        <label className="block text-gray-700 mb-2">Linea</label>
                        <input
                            type="text"
                            name="linea"
                            value={formData.linea}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-4 py-2 rounded"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                            onClick={closeModal}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={handleSubmit}
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tarjetas;