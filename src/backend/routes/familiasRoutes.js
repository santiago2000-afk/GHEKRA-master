import express from 'express';
import familiasController from '../controllers/familiasController.js';

const router = express.Router();

router.get('/familias', familiasController.getAllFamilias);
router.get('/familias/:id', familiasController.getFamiliaById);
router.post('/familias', familiasController.createFamilia);
router.put('/familias/:id', familiasController.updateFamilia);

export default router;