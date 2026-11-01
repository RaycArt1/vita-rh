export function success(res, data, message = "Operación realizada correctamente", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function error(res, message = "Ha ocurrido un error", status = 500) {
  return res.status(status).json({
    success: false,
    message,
  });
}