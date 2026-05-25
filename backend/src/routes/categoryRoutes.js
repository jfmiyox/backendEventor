import express from "express";
import { getCategorias } from "../controllers/categorias/categoriasController.js";


const router = express.Router();

router.get("/categorias", getCategorias);

export default router;