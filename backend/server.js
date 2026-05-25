import './src/config/ejecute.js';
import express from 'express'
import cors from 'cors'

import authRoutes from './src/routes/authRoutes.js'
import testRoutes from './src/routes/testRoutes.js'
import fotoRoutes from './src/routes/photoRoutes.js';
import productsRoutes from './src/routes/productsRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import reviewRoutes from "./src/routes/reviewRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import marcasRoutes from "./src/routes/marcasRoutes.js";
import modelsRoutes from "./src/routes/modelsRoutes.js";
import ubicacionesRoutes from "./src/routes/ubicacionesRoutes.js";
import generoRoutes from "./src/routes/generoRoutes.js";
import paisesRoutes from "./src/routes/paisesRoutes.js";
import reserverRoutes from "./src/routes/reserverRoutes.js";
import ciudadRoutes from "./src/routes/ciudadRoutes.js";
import rolesRoutes from "./src/routes/rolesRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import direccionRoutes from "./src/routes/direccionRoutes.js";
import tipoEventoRoutes from "./src/routes/tipoEventoRoutes.js";

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://tu-frontend.vercel.app", // reemplaza con tu dominio real cuando lo subas
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

const app = express()


app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api', testRoutes);
app.use('/api/fotos', fotoRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes)
app.use('/api/events', eventRoutes);
app.use("/api", reviewRoutes);
app.use("/api", categoryRoutes);
app.use("/api/marcas", marcasRoutes);
app.use("/api", modelsRoutes);
app.use("/api", generoRoutes);
app.use("/api", paisesRoutes);
app.use("/api", ciudadRoutes);
app.use("/api", rolesRoutes);
app.use("/api", userRoutes);
app.use("/api/direcciones", direccionRoutes);
app.use('/api', reserverRoutes);
app.use('/api', tipoEventoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Error interno del servidor' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})