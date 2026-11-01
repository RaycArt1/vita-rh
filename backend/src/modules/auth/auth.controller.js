import * as authService from "./auth.service.js";
import { success, error } from "../../utils/response.js";

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    const respuesta = await authService.login(username, password);

    success(res, respuesta, "Inicio de sesión exitoso");

  } catch (err) {

    error(res, err.message, 401);

  }
}