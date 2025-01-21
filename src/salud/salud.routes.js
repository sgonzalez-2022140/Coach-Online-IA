import { Router } from "express";
import {  procesarSalud, listar, analizarDatos } from "./salud.controller.js";

const api = Router()

//Prueba de envio de datos
api.post('/capturar', procesarSalud);
api.get('/listar', listar)
api.post('/analizar', analizarDatos);

export default api