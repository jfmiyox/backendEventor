import express from "express";
import { getModelos, createModelo } from "../controllers/modelos/modelsController.js";


const router = express.Router();

router.get("/modelos/:marcaId", getModelos);
router.post("/modelos/create", createModelo);

export default router;

