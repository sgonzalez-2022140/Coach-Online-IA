import { HfInference } from "@huggingface/inference";
import { config } from "dotenv";

// Carga las variables de entorno
config();

// Inicializa Hugging Face con la API Key desde `process.env`
export const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Verifica que el token no sea undefined
console.log("prueba:", process.env.HUGGINGFACE_API_KEY);

export default hf;
