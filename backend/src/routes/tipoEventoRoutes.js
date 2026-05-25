import express from 'express';


import { createTipoEvento, getTiposEvento, getTipoEventoById}    from '../controllers/tipoEvento/tipoEventoController.js';
const router = express.Router();

router.post('/createTp', createTipoEvento);
router.get('/tipos-evento', getTiposEvento);
router.get('/:tpeventoId', getTipoEventoById);


export default router;

