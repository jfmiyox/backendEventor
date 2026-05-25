import express from "express";
import { getMarcas, createNewMarca } from "../controllers/marcas/marcasController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/marcas", getMarcas);
router.post("/createM", verifyToken , createNewMarca);

export default router;