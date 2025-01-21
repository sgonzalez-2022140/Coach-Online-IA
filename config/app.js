//Levantamos el serivdor http con express   
'use strict'

import { HfInference } from "@huggingface/inference";
import { config } from "dotenv";
import express from "express";


//Importación de rutas del sistema
import saludRoutes from "../src/salud/salud.routes.js"

// Cargar variables de entorno
config();

export const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Verifica que la API Key se está cargando correctamente
console.log("Hugging Face API Key:", process.env.HUGGINGFACE_API_KEY);

export default hf;


// Configuraciones
const app = express();
app.use(express.json())
const port = process.env.PORT || 3056;

//usar rutas para crear apis
app.use('/salud', saludRoutes)


export const initServer = () => {
    app.listen(port, () => {
        console.log(`Server HTTP running on port ${port}`);
    });
};