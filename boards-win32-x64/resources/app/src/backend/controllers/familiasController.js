import db from '../config/database.js';

const familiasController = {
    // Obtener todas las familias
    getFamilias: async (req, res) => {
        try {
            const familias = await db.collection('familias').find().toArray();
            res.status(200).json(familias);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener las familias', error });
        }
    },

    // Obtener una familia por ID
    getFamiliaById: async (req, res) => {
        try {
            const { id } = req.params;
            const familia = await db.collection('familias').findOne({ _id: id });
            if (!familia) {
                return res.status(404).json({ message: 'Familia no encontrada' });
            }
            res.status(200).json(familia);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener la familia', error });
        }
    },

    // Crear una nueva familia
    createFamilia: async (req, res) => {
        try {
            const nuevaFamilia = req.body;
            const result = await db.collection('familias').insertOne(nuevaFamilia);
            res.status(201).json(result.ops[0]);
        } catch (error) {
            res.status(500).json({ message: 'Error al crear la familia', error });
        }
    },

    // Actualizar una familia
    updateFamilia: async (req, res) => {
        try {
            const { id } = req.params;
            const familiaActualizada = await db.collection('familias').findOneAndUpdate(
                { _id: id },
                { $set: req.body },
                { returnDocument: 'after' }
            );
            if (!familiaActualizada.value) {
                return res.status(404).json({ message: 'Familia no encontrada' });
            }
            res.status(200).json(familiaActualizada.value);
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar la familia', error });
        }
    },

    // Eliminar una familia
    deleteFamilia: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.collection('familias').deleteOne({ _id: id });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Familia no encontrada' });
            }
            res.status(200).json({ message: 'Familia eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar la familia', error });
        }
    }
};

export default familiasController;
