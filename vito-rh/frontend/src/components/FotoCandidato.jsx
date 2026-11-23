import { useEffect, useState } from "react";
import api from "../services/api";

// Las fotografías son privadas: las solicita el administrador autenticado.
export default function FotoCandidato({ candidato, iniciales }) {
  const [fotoUrl, setFotoUrl] = useState(null);

  useEffect(() => {
    let activo = true;
    let urlCreada = null;
    setFotoUrl(null);

    if (candidato?.id && candidato?.fotoArchivo) {
      api.get(`/reclutamiento/${candidato.id}/fotografia-postulante`, {
        responseType: "blob",
      }).then(({ data }) => {
        urlCreada = URL.createObjectURL(data);
        if (activo) setFotoUrl(urlCreada);
        else URL.revokeObjectURL(urlCreada);
      }).catch(() => {
        // Si no hay una fotografía accesible, mostramos las iniciales.
      });
    }

    return () => {
      activo = false;
      if (urlCreada) URL.revokeObjectURL(urlCreada);
    };
  }, [candidato?.id, candidato?.fotoArchivo]);

  return fotoUrl ? (
    <img
      src={fotoUrl}
      alt={`Fotografía de ${candidato?.nombre || "candidato"}`}
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
    />
  ) : (
    <>{iniciales}</>
  );
}
