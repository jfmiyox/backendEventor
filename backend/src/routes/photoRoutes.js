import express from 'express'
import multer from 'multer';
const router = express.Router();

import {subirFotoPreview, confirmarFotoPerfil, obtenerFotoPerfil, obtenerFotoProducto, confirmarFotoProducto, confirmarFotoUbicacion, obtenerFotoUbicacion, obtenerFotosEvento , confirmarFotoEvento} from '../controllers/fotoController.js'

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-preview', upload.single('photo'), subirFotoPreview);
router.post('/confirm-photo', confirmarFotoPerfil);
router.get('/perfil/:userId', obtenerFotoPerfil);
router.post('/confirm-ph-product', confirmarFotoProducto);
router.get('/producto/:productoId', obtenerFotoProducto);
router.post('/confirm-photo-ubicacion', confirmarFotoUbicacion);
router.get('/ubicacion/:ubicacionId', obtenerFotoUbicacion);
router.post('/confirm-photo-evento', confirmarFotoEvento);
router.get('/ubicacion/:eventoId', obtenerFotosEvento);


export default router;

