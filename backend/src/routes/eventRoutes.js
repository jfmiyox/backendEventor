import express from 'express';
import { getEventos, getEventsById , createEvento, deleteEvento} from '../controllers/events/eventsController.js';

const router = express.Router();

router.get('/', getEventos);
router.get('/:id', getEventsById);
router.post('/eventos', createEvento);
router.delete('/:eventoId', deleteEvento);


export default router;