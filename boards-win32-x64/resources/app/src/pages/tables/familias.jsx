import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const Familias = () => {
    const [data, setData] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [formData, setFormData] = useState({ nombre: "" });
    const [currentItem, setCurrentItem] = useState(null);

    // Obtener datos del endpoint
    const fetchData = () => {
        fetch("http://localhost:3000/familias")
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error("Error al obtener familias:", error));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (type, item = null) => {
        setModalType(type);
        setCurrentItem(item);
        setModalIsOpen(true);
        if (item) {
            setFormData({ nombre: item.nombre });
        } else {
            setFormData({ nombre: "" });
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setFormData({ nombre: "" });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        return formData.nombre.trim() !== ""; // Validación básica
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            console.error("El campo 'nombre' es obligatorio");
            return;
        }

        const newItem = { nombre: formData.nombre };

        // Agregar nueva familia
        if (modalType === "add") {
            // Enviar datos al backend para agregar nueva familia
            fetch("http://localhost:3000/familias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Error al agregar familia: ${response.statusText}`);
                    }
                    return response.text();  // Obtener la respuesta como texto plano
                })
                .then((text) => {
                    console.log("Respuesta del servidor:", text);  // Mensaje de éxito o error
                    fetchData();  // Recargar los datos después de agregar el item
                    closeModal();
                })
                .catch((error) => {
                    console.error("Error al agregar familia:", error);
                });
        } 
        // Actualizar familia existente
        else if (modalType === "edit" && currentItem && currentItem.id) {
            const updatedItem = { nombre: formData.nombre };

            // Enviar datos al backend para actualizar la familia
            fetch(`http://localhost:3000/familias/${currentItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedItem),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Error al actualizar familia: ${response.statusText}`);
                    }
                    return response.text();  // Obtener la respuesta como texto plano
                })
                .then((text) => {
                    console.log("Respuesta del servidor:", text);  // Mensaje de éxito o error
                    fetchData();  // Recargar los datos después de la actualización
                    closeModal();
                })
                .catch((error) => {
                    console.error("Error al actualizar familia:", error);
                });
        }
    };

    const handleDelete = (id) => {
        // Confirmación antes de eliminar
        if (window.confirm("¿Estás seguro de que deseas eliminar esta familia?")) {
            // Enviar solicitud DELETE para eliminar la familia
            fetch(`http://localhost:3000/familias/${id}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Error al eliminar familia: ${response.statusText}`);
                    }
                    return response.text();  // Obtener la respuesta como texto plano
                })
                .then((text) => {
                    console.log("Respuesta del servidor:", text);  // Mensaje de éxito o error
                    fetchData();  // Recargar los datos después de eliminar el ítem
                })
                .catch((error) => {
                    console.error("Error al eliminar familia:", error);
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
                        <th className="border border-gray-300 px-4 py-2">Nombre</th>
                        <th className="border border-gray-300 px-4 py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td className="border border-gray-300 px-4 py-2">{item.nombre}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <button
                                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                    onClick={() => openModal("edit", item)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                    onClick={() => handleDelete(item.id)}  // Llamar a handleDelete con el id del item
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
                    {modalType === "add" ? "Agregar Familia" : "Editar Familia"}
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

export default Familias;