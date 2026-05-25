import express from 'express';
import { getDireccionById, getDirecciones, createDireccion } from '../controllers/direcciones/direccionController.js';
const router = express.Router();

router.get('/',getDirecciones);
router.get('/:id', getDireccionById);
router.post('/create', createDireccion);

export default router;

