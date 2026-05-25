import express from 'express';

const router = express.Router();

import {
    createReservation,
    getReservationsByUser,
    getReservationsByUserNotExpired
} from '../controllers/reserverController.js';

router.post('/post-reserve', createReservation);
router.get('/reserves/:userId', getReservationsByUser);
router.get('/reserves-active/:userId', getReservationsByUserNotExpired);


export default router;