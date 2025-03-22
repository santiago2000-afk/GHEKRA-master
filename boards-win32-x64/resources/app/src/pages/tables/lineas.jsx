import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const Lineas = () => {
    const [data, setData] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [formData, setFormData] = useState({ nombre: "", familiaId: "" });
    const [currentItem, setCurrentItem] = useState(null);

    // Obtener datos del endpoint
    const fetchData = async () => {
        try {
            const response = await fetch("http://localhost:3000/lineas");
            if (!response.ok) throw new Error("Error al obtener líneas");
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (type, item = null) => {
        setModalType(type);
        setCurrentItem(item);
        setModalIsOpen(true);
        setFormData(item ? { nombre: item.nombre, familiaId: item.familia_id } : { nombre: "", familiaId: "" });
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setCurrentItem(null);
        setFormData({ nombre: "", familiaId: "" });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === "familiaId" ? Number(value) || "" : value }));
    };

    const validateForm = () => formData.nombre.trim() !== "" && formData.familiaId !== "";

    const handleSubmit = async () => {
        if (!validateForm()) {
            console.error("Todos los campos son obligatorios");
            return;
        }
    
        const newItem = { nombre: formData.nombre, familia_id: formData.familiaId };
    
        console.log("Datos a enviar:", newItem);  // Verifica los datos
    
        try {
            const url = modalType === "edit" ? `http://localhost:3000/lineas/${currentItem.id}` : "http://localhost:3000/lineas";
            const method = modalType === "edit" ? "PUT" : "POST";
    
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem),
            });
    
            if (!response.ok) throw new Error(`Error al ${modalType === "edit" ? "actualizar" : "agregar"} línea`);
    
            // Verifica si la respuesta es JSON o texto
            const contentType = response.headers.get("Content-Type");
            let result;
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                result = await response.text();
            }
    
            console.log(result); // Mensaje esperado: "Línea actualizada correctamente" o similar
    
            fetchData();
            closeModal();
        } catch (error) {
            console.error(error);
        }
    };    

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta línea?")) return;

        try {
            const response = await fetch(`http://localhost:3000/lineas/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Error al eliminar línea");
            
            // Elimina el item directamente del estado sin volver a hacer fetch
            setData((prevData) => prevData.filter((item) => item.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-end mb-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => openModal("add")}>
                    Agregar Línea
                </button>
            </div>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">Nombre</th>
                        <th className="border border-gray-300 px-4 py-2">Familia ID</th>
                        <th className="border border-gray-300 px-4 py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td className="border border-gray-300 px-4 py-2">{item.nombre}</td>
                            <td className="border border-gray-300 px-4 py-2">{item.familia_id}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" onClick={() => openModal("edit", item)}>
                                    Editar
                                </button>
                                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(item.id)}>
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
                    {modalType === "add" ? "Agregar Línea" : "Editar Línea"}
                </h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-4 py-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Familia ID</label>
                        <input
                            type="number"
                            name="familiaId"
                            value={formData.familiaId}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-4 py-2 rounded"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={closeModal}>
                            Cancelar
                        </button>
                        <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
                            Guardar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Lineas;