"use strict";
import hf from "../../config/huggingface.js";

//Variable global
const datosSalud = [];

export const listar = async (req, res) => {
  try {
    // Verificar si hay datos en memoria
    if (datosSalud.length === 0) {
      return res.status(200).send({ message: "No hay datos almacenados aún" });
    }

    // Enviar los datos como respuesta
    return res.status(200).send({
      message: "Datos de salud listados correctamente",
      data: datosSalud,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Error al listar datos", error });
  }
};

export const procesarSalud = async (req, res) => {
  try {
    const { peso, altura, edad, caloriasDiarias } = req.body;

    if (!peso || !altura || !edad || !caloriasDiarias) {
      return res
        .status(400)
        .send({ message: "Todos los campos son requeridos" });
    }

    // Guardar los datos en memoria
    datosSalud.push({ peso, altura, edad, caloriasDiarias, fecha: new Date() });
    console.log("Datos actuales:", datosSalud); // Confirma que se están guardando

    return res.status(200).send({
      message: "Datos capturados correctamente",
      data: { peso, altura, edad, caloriasDiarias },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Error al capturar datos", error });
  }
};

/* 
// ///////////////////////////////////////////////////////////// //
//                  Parte Logica donde entra la IA               //
// //////////////////////////////////////////////////////////// //
*/
// Analizar datos con IA
export const analizarDatos = async (req, res) => {
  try {
    const { peso, altura, edad, tipoCuerpo } = req.body;

    if (!peso || !altura || !edad || !tipoCuerpo) {
      return res.status(400).send({ message: "Todos los campos son requeridos" });
    }

    if (isNaN(peso) || isNaN(altura) || isNaN(edad)) {
      return res
        .status(400)
        .send({ message: "Peso, altura y edad deben ser números válidos" });
    }

    const calcularIMC = (peso, altura) => (peso / (altura * altura)).toFixed(2);
    const interpretarIMC = (imc) => {
      if (imc < 18.5) return "underweight";
      if (imc >= 18.5 && imc <= 24.9) return "normal";
      if (imc >= 25 && imc <= 29.9) return "overweight";
      return "obese";
    };

    const imc = calcularIMC(peso, altura);
    const clasificacionIMC = interpretarIMC(imc);

    // Prompt enfocado en resultados importantes
    const prompt = `
      Based on the following health data:
      - Weight: ${peso} kg
      - Height: ${altura} m
      - Age: ${edad} years
      - BMI: ${imc} (${clasificacionIMC})

      Provide a brief explanation of the user's health status. 
      Respond in simple terms by stating whether the BMI is normal, underweight, overweight, or obese. 
      Highlight the health status clearly and whether it indicates a healthy or unhealthy range. Avoid repeating definitions or unnecessary details.
    `;

    const response = await hf.textGeneration({
      model: "google/flan-t5-large",
      inputs: prompt,
      parameters: { max_new_tokens: 100 },
    });

    const recomendaciones = recomendacionesGuardadas[clasificacionIMC] || [];

    return res.status(200).send({
      message: "Análisis completo",
      imc,
      clasificacionIMC,
      explicacion: response.generated_text.trim(),
      recomendaciones,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).send({ message: "Error durante el análisis", error });
  }
};



const recomendacionesGuardadas = {
  underweight: [
    "Consume alimentos ricos en proteínas como pollo, pescado y huevos.",
    "Incluye carbohidratos complejos como arroz integral, pasta y avena.",
    "Añade frutos secos y semillas a tus comidas para aumentar calorías saludables.",
  ],
  normal: [
    "Mantén una dieta balanceada con frutas, verduras, proteínas y carbohidratos.",
    "Realiza ejercicio regularmente, combinando cardio y entrenamiento de fuerza.",
    "Bebe al menos 2 litros de agua al día.",
  ],
  overweight: [
    "Reduce la ingesta de calorías, evitando alimentos procesados y azúcares añadidos.",
    "Incorpora más verduras y proteínas magras a tu dieta.",
    "Realiza ejercicios cardiovasculares como caminar, correr o nadar al menos 30 minutos al día.",
  ],
  obese: [
    "Consulta a un nutricionista para una dieta personalizada.",
    "Evita el consumo de alimentos fritos, dulces y bebidas azucaradas.",
    "Realiza actividad física moderada y aumenta gradualmente la intensidad.",
  ],
};