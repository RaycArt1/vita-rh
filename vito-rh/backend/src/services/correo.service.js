import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function enviarCorreoRecuperacion(destino, enlace) {
  await transporter.sendMail({
    from: `"Vito RH" <${process.env.SMTP_USER}>`,
    to: destino,
    subject: "Recuperación de contraseña - Vita RH",
    text: `Recibimos una solicitud para restablecer tu contraseña.\n\nUsa este enlace (válido por 10 minutos):\n${enlace}\n\nSi no fuiste tú, ignora este mensaje.`,
  });
}