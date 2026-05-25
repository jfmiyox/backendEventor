import express from "express";
import { getGeneroById, getGeneros } from "../controllers/genero/generosController.js";


const router = express.Router();

router.get("/generos", getGeneros);
router.get("/genedoID", getGeneroById);

export default router;