
import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      mensaje: "Debes iniciar sesión para realizar esta operación.",
    });
  }

  const token = autorizacion.slice(7);

  try {
    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
      console.error("Falta configurar JWT_SECRET.");
      return res.status(500).json({
        success: false,
        mensaje: "La autenticación no está configurada.",
      });
    }

    const usuario = jwt.verify(token, secreto);

    if (!usuario.id) {
      return res.status(401).json({
        success: false,
        mensaje: "El token no contiene un usuario válido.",
      });
    }

    req.usuario = {
      id: Number(usuario.id),
      username: usuario.username,
      rol: usuario.rol,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      mensaje: "La sesión es inválida o ha expirado.",
    });
  }
}
