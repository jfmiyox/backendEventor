import express from 'express'
import { createPerfilFromAdmin , getUsers , getUserById, updateUser, deleteUser } from '../controllers/usuarios/usuariosController.js';

const router = express.Router();

router.post('/createAd', createPerfilFromAdmin);
router.get('/usersAv', getUsers);
router.get('/usersAv/:id', getUserById);
router.put('/usersAv/:id', updateUser);
router.delete('/usersAv/:id', deleteUser);


export default router;