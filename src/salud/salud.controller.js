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
export const analizarDatos = async (req, res) => {
    try {
        const { peso, altura, edad, tipoCuerpo } = req.body;

        if (!peso || !altura || !edad || !tipoCuerpo) {
            return res.status(400).send({ message: "All fields are required" });
        }

        // Función para interpretar el IMC
        const interpretarIMC = (imc) => {
            if (imc < 18.5) return "underweight";
            if (imc >= 18.5 && imc <= 24.9) return "normal";
            if (imc >= 25 && imc <= 29.9) return "overweight";
            return "obese";
        };

        // Calcular IMC y clasificar
        const imc = calcularIMC(peso, altura);
        const clasificacionIMC = interpretarIMC(imc);

        // Prompt mejorado
        const prompt = `
        The user's health data:
        - Weight: ${peso} kg
        - Height: ${altura} m
        - Age: ${edad} years
        - Body type: ${tipoCuerpo} (ectomorph, mesomorph, endomorph)
        - BMI: ${imc} (${clasificacionIMC})

        Analyze this data and provide the following:
        1. A brief explanation of the BMI result (e.g., "Your BMI is X, which is classified as Y. This means...").
        2. Dietary recommendations:
           - Daily calorie intake (e.g., "You should consume X calories/day").
           - Specific foods to include in the diet (e.g., "Add chicken, rice, and sweet potatoes").
        3. Exercise recommendations:
           - Suggested workouts (e.g., "Strength training, including squats and bench press").
           - Frequency of exercise (e.g., "3-4 times per week").
        4. Daily habits to improve health (e.g., "Drink X liters of water, sleep Y hours, etc.").

        Respond clearly and concisely.
        `;

        const response = await hf.textGeneration({
            model: "google/flan-t5-large",
            inputs: prompt,
            parameters: { max_new_tokens: 250 },
        });

        return res.status(200).send({
            message: "Analysis complete",
            recomendacion: response.generated_text,
        });
    } catch (error) {
        console.error(error.response?.data || error.message);
        return res.status(500).send({ message: "Error during analysis", error });
    }
};

// Función para calcular el IMC
const calcularIMC = (peso, altura) => (peso / (altura * altura)).toFixed(2);
