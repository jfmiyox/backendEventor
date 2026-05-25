import express from "express";
import { getCiudades, getCiudadById } from "../controllers/ciudad/ciudadController.js"; 


const router = express.Router();

router.get("/ciudades", getCiudades);
router.get("/ciudadId", getCiudadById);

export default router;