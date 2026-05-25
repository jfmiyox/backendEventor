import express from "express";
import { getCountries, getCountryById } from "../controllers/paises/paisesController.js";

const router = express.Router();

router.get("/paises", getCountries);
router.get("/countryID", getCountryById)

export default router;