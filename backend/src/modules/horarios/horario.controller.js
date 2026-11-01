import * as horarioService from "./horario.service.js";

export async function obtenerHorarios(req, res) {
  try {
    const horarios = await horarioService.obtenerHorarios();

    res.json(horarios);

  } catch (error) {

    res.status(500).json({
      mensaje: error.message,
    });

  }
}

export async function crearHorario(req, res) {
  try {
    const horario = await horarioService.crearHorario(req.body);

    res.status(201).json(horario);

  } catch (error) {

    res.status(500).json({
      mensaje: error.message,
    });

  }
}