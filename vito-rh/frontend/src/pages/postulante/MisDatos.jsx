import { useEffect, useState } from "react";
import { guardarMiPerfil, obtenerFotoPrivada, obtenerMiPerfil } from "../../services/postulanteService";

export default function MisDatos() {
  const [perfil, setPerfil] = useState(null);
  const [foto, setFoto] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    obtenerMiPerfil().then((data) => {
      if (!activo) return;
      setPerfil(data);
      if (data.tieneFoto) obtenerFotoPrivada().then((url) => {
        if (activo) setImagen(url); else URL.revokeObjectURL(url);
      }).catch(() => {});
    }).catch(() => { if (activo) setError("No se pudo cargar tu perfil."); });
    return () => { activo = false; };
  }, []);

  useEffect(() => () => { if (imagen) URL.revokeObjectURL(imagen); }, [imagen]);

  const actualizar = (campo, valor) => setPerfil((a) => ({ ...a, [campo]: valor }));
  async function guardar(e) {
    e.preventDefault(); setError(""); setMensaje(""); setGuardando(true);
    try {
      await guardarMiPerfil({ ...perfil, foto });
      setMensaje("Tu información se guardó correctamente.");
      setFoto(null);
      if (foto) {
        const url = await obtenerFotoPrivada();
        setImagen(url);
      }
    } catch (err) { setError(err.response?.data?.mensaje || "No se pudieron guardar tus datos."); }
    finally { setGuardando(false); }
  }
  return <>
    <header className="ps-pagina-cabecera"><small>Información personal, fotografía y referencias</small><h1>Mis datos</h1></header>
    {error && <p className="ps-alerta error">{error}</p>}{mensaje && <p className="ps-alerta ok">{mensaje}</p>}
    {perfil && <section className="ps-tarjeta ps-perfil-card">
      <div className="ps-foto-area">
        <div className="ps-foto">{imagen ? <img src={imagen} alt="Tu foto de perfil" /> : "FOTO"}</div>
        <div><h2>{perfil.nombre} {perfil.apellido}</h2><small>{perfil.email}</small></div>
      </div>
      <form className="ps-form" onSubmit={guardar}>
        <label>Fotografía (JPG o PNG, hasta 3 MB)
          <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return;
            if (f.size > 3*1024*1024) { setError("La fotografía no debe superar los 3 MB."); e.target.value = ""; return; }
            setError(""); setFoto(f);
          }} />
        </label>
        <label>Información de contacto
          <input value={perfil.telefono || ""} onChange={(e) => actualizar("telefono", e.target.value)} placeholder="9999-9999" maxLength={24} />
        </label>
        <label>Dirección
          <textarea rows={2} value={perfil.direccion || ""} onChange={(e) => actualizar("direccion", e.target.value)} placeholder="Tu dirección de residencia" maxLength={400} />
        </label>
        <label>Referencias personales o laborales
          <textarea rows={3} value={perfil.referencias || ""} onChange={(e) => actualizar("referencias", e.target.value)} placeholder="Nombre, relación o empresa y teléfono" maxLength={1000} />
        </label>
        <label>Observaciones
          <textarea rows={3} value={perfil.observaciones || ""} onChange={(e) => actualizar("observaciones", e.target.value)} placeholder="Información adicional que desees compartir" maxLength={1000} />
        </label>
        <div><button type="submit" className="ps-boton" disabled={guardando}>{guardando ? "Guardando…" : "Guardar información"}</button></div>
      </form>
    </section>}
  </>;
}
