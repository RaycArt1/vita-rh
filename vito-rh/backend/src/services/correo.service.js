import nodemailer from "nodemailer";

export async function enviarCorreoRecuperacion(destino, enlace) {
  console.log("\n==================================================");
  console.log("🔔 [ENLACE DE RECUPERACIÓN - VITO RH]");
  console.log(`📧 Destinatario: ${destino}`);
  console.log(`🔗 Enlace para restablecer: ${enlace}`);
  console.log("==================================================\n");

  // ⚠️ REEMPLAZA ÚNICAMENTE ESTAS DOS LÍNEAS CON TUS DATOS REALES:
  const usuarioSMTP = "vita.rh.sistema@gmail.com"; 
  const passSMTP = "trpl qslq ypdz jqrp"; 

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: usuarioSMTP,
        pass: passSMTP,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Vito RH - Recursos Humanos" <${usuarioSMTP}>`,
      to: destino,
      subject: "Recuperación de contraseña - Vito RH",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #dc3545; text-align: center;">Vito Pizzería - Recursos Humanos</h2>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el sistema <strong>GestRH</strong>.</p>
          <p>Haz clic en el siguiente botón para continuar (válido por 10 minutos):</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${enlace}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="font-size: 11px; word-break: break-all; color: #0056b3;">${enlace}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 25px;" />
          <p style="font-size: 11px; color: #999; text-align: center;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ ¡Correo enviado con éxito a la bandeja real de:", destino, "!");
    return info;

  } catch (error) {
    console.warn("⚠️ Aviso de Nodemailer: No se pudo enviar por correo real.");
    console.warn("Detalle del error:", error.message);
    return { success: true };
  }
}