import express from 'express';
import { getUbicaciones, getUbicacionById, createUbicacion, deleteUbicacion, updateUbicacion} from '../controllers/ubicaciones/ubicacionesController.js';

const router = express.Router();

router.post('/create', createUbicacion);
router.get('/', getUbicaciones);
router.get('/:id', getUbicacionById);
router.delete('/:id', deleteUbicacion);
router.put('/:id', updateUbicacion);




export default router;