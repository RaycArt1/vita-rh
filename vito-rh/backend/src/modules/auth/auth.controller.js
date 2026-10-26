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

export async function solicitarRecuperacion(req, res) {
  try {
    const correo = String(req.body.correo ?? "").trim().toLowerCase();

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: "Debes indicar tu correo.",
      });
    }

    await authService.solicitarRecuperacion(correo);

    // Respuesta igual exista o no el correo, para no revelar cuentas registradas
    res.json({
      success: true,
      message: "Si el correo está registrado, te enviamos instrucciones para restablecer tu contraseña.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "No se pudo procesar la solicitud. Inténtalo más tarde.",
    });
  }
}

export async function restablecerContrasena(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Debes indicar el enlace y la nueva contraseña.",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres.",
      });
    }

    await authService.restablecerContrasena(String(token), String(password));

    res.json({
      success: true,
      message: "Tu contraseña fue actualizada. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    if (error.message.includes("no es válido")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "No se pudo restablecer la contraseña. Inténtalo más tarde.",
    });
  }
}
