import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost/TPI-BIGDATA/backend/api";

function App() {
  const [vista, setVista] = useState("inicio");
  const [cursos, setCursos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [metricas, setMetricas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [resumen, setResumen] = useState(null);

  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [codigoLogin, setCodigoLogin] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    curso: "",
    tipoRegistro: "gratis",
    fuenteTrafico: "Instagram Ads",
  });

  const companeros = [
    "Tomas Vega",
    "Franco Benitez",
    "Facundo Cristaldo",
    "Sofía Martínez",
    "Nicolás Acosta",
  ];

  useEffect(() => {
    cargarDatosPublicos();
    cargarUsuarios();
  }, []);

  const cargarDatosPublicos = async () => {
    try {
      const respuesta = await fetch(`${API}/cursos.php`);
      const datos = await respuesta.json();

      if (datos.success) {
        setCursos(datos.cursos);
        setArticulos(datos.articulos);
        setMetricas(datos.metricas);
      }
    } catch (error) {
      setMensaje("No se pudo conectar con el backend de cursos.");
    }
  };

  const cargarUsuarios = async () => {
    try {
      const respuesta = await fetch(`${API}/usuarios.php`);
      const datos = await respuesta.json();

      if (datos.success) {
        setUsuarios(datos.usuarios);
        setResumen(datos.resumen);
      }
    } catch (error) {
      setMensaje("No se pudo cargar el panel administrativo.");
    }
  };

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
    setMensaje("");

    if (nuevaVista === "admin") {
      cargarUsuarios();
    }
  };

  const seleccionarCurso = (curso) => {
    setCursoSeleccionado(curso);
    setFormulario({
      ...formulario,
      curso: curso.nombre,
    });
    setVista("detalle");
    setMensaje("");
  };

  const irARegistro = (curso = null) => {
    if (curso) {
      setFormulario({
        ...formulario,
        curso: curso.nombre,
      });
      setCursoSeleccionado(curso);
    }

    setVista("registro");
    setMensaje("");
  };

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const enviarRegistro = async (e) => {
    e.preventDefault();

    if (
      formulario.nombre.trim() === "" ||
      formulario.email.trim() === "" ||
      formulario.telefono.trim() === "" ||
      formulario.curso.trim() === ""
    ) {
      setMensaje("Completá todos los campos para generar el registro.");
      return;
    }

    try {
      const respuesta = await fetch(`${API}/registrar.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const datos = await respuesta.json();

      if (datos.success) {
        if (datos.estado === "Acceso habilitado") {
          setMensaje(
            `Registro exitoso. Tu código de acceso gratuito es: ${datos.codigo}`,
          );
        } else {
          setMensaje(
            `Registro generado. Tu código es ${datos.codigo}, pero queda pendiente hasta confirmar el pago.`,
          );
        }

        setFormulario({
          nombre: "",
          email: "",
          telefono: "",
          curso: "",
          tipoRegistro: "gratis",
          fuenteTrafico: "Instagram Ads",
        });

        setCursoSeleccionado(null);
        cargarUsuarios();
      } else {
        setMensaje(datos.message);
      }
    } catch (error) {
      setMensaje("Error al registrar. Revisá si Apache y MySQL están activos.");
    }
  };

  const ingresarConCodigo = async (e) => {
    e.preventDefault();

    if (codigoLogin.trim() === "") {
      setMensaje("Ingresá un código de acceso.");
      return;
    }

    try {
      const respuesta = await fetch(`${API}/login_codigo.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoLogin,
        }),
      });

      const datos = await respuesta.json();

      if (datos.success) {
        setUsuarioActivo(datos.usuario);
        setMateriales(datos.materiales);
        setCodigoLogin("");
        setVista("aula");
        setMensaje("");
      } else {
        setMensaje(datos.message);
      }
    } catch (error) {
      setMensaje("No se pudo ingresar. Revisá el backend.");
    }
  };

  const confirmarPago = async (idUsuario) => {
    try {
      const respuesta = await fetch(`${API}/confirmar_pago.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: idUsuario,
        }),
      });

      const datos = await respuesta.json();
      setMensaje(datos.message);
      cargarUsuarios();
    } catch (error) {
      setMensaje("No se pudo confirmar el pago.");
    }
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
    setMateriales([]);
    setVista("inicio");
  };

  const cursoDelUsuario = cursos.find(
    (curso) => curso.nombre === usuarioActivo?.curso,
  );

  return (
    <div className="app">
      <header className="header">
        <nav className="navbar">
          <h1>Tech Academy</h1>

          <ul>
            <li>
              <button onClick={() => cambiarVista("inicio")}>Inicio</button>
            </li>
            <li>
              <button onClick={() => cambiarVista("cursos")}>Cursos</button>
            </li>
            <li>
              <button onClick={() => cambiarVista("blog")}>Blog SEO</button>
            </li>
            <li>
              <button onClick={() => cambiarVista("journey")}>
                Customer Journey
              </button>
            </li>
            <li>
              <button onClick={() => cambiarVista("registro")}>Registro</button>
            </li>
            <li>
              <button onClick={() => cambiarVista("login")}>Ingresar</button>
            </li>
            <li>
              <button onClick={() => cambiarVista("admin")}>Admin</button>
            </li>
          </ul>
        </nav>
      </header>

      {vista === "inicio" && (
        <>
          <section className="hero">
            <div className="hero-text">
              <span className="tag">Campaña activa: primera clase gratis</span>
              <h2>Aprendé programación y desarrollá tu futuro profesional</h2>
              <p>
                Plataforma educativa dinámica con cursos, certificaciones, aula
                virtual, códigos de acceso, seguimiento de alumnos y medición de
                campañas.
              </p>

              <div className="hero-actions">
                <button
                  onClick={() => cambiarVista("cursos")}
                  className="btn primary"
                >
                  Ver cursos
                </button>
                <button
                  onClick={() => cambiarVista("registro")}
                  className="btn secondary"
                >
                  Registrarme
                </button>
              </div>
            </div>

            <div className="ad-card">
              <h3>Desarrollo Web Full Stack</h3>
              <p>25% OFF + certificación digital</p>
              <strong>
                {resumen?.total_usuarios || 0} usuarios registrados
              </strong>
              <span>SEO + Ads + Email Marketing + PostHog</span>
            </div>
          </section>

          <section className="section">
            <h2>Embudo de conversión</h2>
            <p className="subtitle">
              La web acompaña al usuario desde que descubre la campaña hasta que
              se matricula y accede al aula virtual.
            </p>

            <div className="steps">
              <div>
                <span>1</span>
                <h3>Descubrimiento</h3>
                <p>
                  El usuario llega desde Instagram Ads, Google Search o
                  contenido SEO.
                </p>
              </div>

              <div>
                <span>2</span>
                <h3>Consideración</h3>
                <p>
                  Consulta cursos, temarios, docentes, precios, cupos y
                  beneficios.
                </p>
              </div>

              <div>
                <span>3</span>
                <h3>Conversión</h3>
                <p>
                  Completa el formulario, recibe un código y queda registrado en
                  la base.
                </p>
              </div>

              <div>
                <span>4</span>
                <h3>Retención</h3>
                <p>
                  Ingresa al aula, consulta materiales y avanza hacia el
                  certificado.
                </p>
              </div>
            </div>
          </section>

          <section className="section blue">
            <h2>Elementos publicitarios</h2>

            <div className="cards">
              <article className="card center">
                <h3>Primera clase gratis</h3>
                <p>
                  Registro automático con código DEMO para captar potenciales
                  alumnos.
                </p>
              </article>

              <article className="card center">
                <h3>25% OFF</h3>
                <p>Promoción orientada a aumentar la matriculación efectiva.</p>
              </article>

              <article className="card center">
                <h3>Certificación digital</h3>
                <p>
                  Beneficio final para favorecer recomendación y difusión en
                  redes.
                </p>
              </article>
            </div>
          </section>
        </>
      )}

      {vista === "cursos" && (
        <section className="section">
          <h2>Catálogo de cursos</h2>
          <p className="subtitle">
            Cursos pensados para atraer tráfico cualificado y convertir
            visitantes en alumnos.
          </p>

          <div className="cards">
            {cursos.map((curso) => (
              <article key={curso.id_curso} className="card">
                <span className="promo">{curso.promo}</span>
                <h3>{curso.nombre}</h3>
                <p>{curso.descripcion}</p>

                <ul>
                  <li>Duración: {curso.duracion}</li>
                  <li>Modalidad: {curso.modalidad}</li>
                  <li>Nivel: {curso.nivel}</li>
                  <li>Profesor: {curso.profesor}</li>
                  <li>Cupos disponibles: {curso.cupos}</li>
                </ul>

                <h4>${Number(curso.precio).toLocaleString("es-AR")}</h4>

                <button onClick={() => seleccionarCurso(curso)}>
                  Ver detalle
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {vista === "detalle" && cursoSeleccionado && (
        <section className="section">
          <div className="detail">
            <span className="promo">{cursoSeleccionado.promo}</span>
            <h2>{cursoSeleccionado.nombre}</h2>
            <p>{cursoSeleccionado.descripcion}</p>

            <div className="detail-grid">
              <div>
                <h3>Información del curso</h3>
                <p>
                  <strong>Duración:</strong> {cursoSeleccionado.duracion}
                </p>
                <p>
                  <strong>Modalidad:</strong> {cursoSeleccionado.modalidad}
                </p>
                <p>
                  <strong>Nivel:</strong> {cursoSeleccionado.nivel}
                </p>
                <p>
                  <strong>Cupos:</strong> {cursoSeleccionado.cupos}
                </p>
                <p>
                  <strong>Precio:</strong> $
                  {Number(cursoSeleccionado.precio).toLocaleString("es-AR")}
                </p>
              </div>

              <div>
                <h3>Docente asignado</h3>
                <p>
                  <strong>{cursoSeleccionado.profesor}</strong>
                </p>
                <p>{cursoSeleccionado.especialidad}</p>
                <p>{cursoSeleccionado.email_profesor}</p>
                <p>{cursoSeleccionado.horario_consulta}</p>
              </div>

              <div>
                <h3>Objetivo de campaña</h3>
                <p>
                  Este curso forma parte de la estrategia de conversión para
                  aumentar la matriculación y reducir el costo de adquisición de
                  alumnos.
                </p>
              </div>
            </div>

            <button
              className="btn primary"
              onClick={() => irARegistro(cursoSeleccionado)}
            >
              Inscribirme ahora
            </button>
          </div>
        </section>
      )}

      {vista === "blog" && (
        <section className="section">
          <h2>Blog SEO</h2>
          <p className="subtitle">
            Artículos técnicos pensados para captar usuarios desde Google y
            dirigirlos hacia los cursos relacionados.
          </p>

          <div className="cards">
            {articulos.map((articulo) => (
              <article key={articulo.id_articulo} className="card">
                <span className="promo">Keyword: {articulo.palabra_clave}</span>
                <h3>{articulo.titulo}</h3>
                <p>{articulo.resumen}</p>
                <strong>Curso relacionado: {articulo.curso_relacionado}</strong>

                <button
                  onClick={() => {
                    const curso = cursos.find(
                      (c) => c.nombre === articulo.curso_relacionado,
                    );

                    if (curso) {
                      seleccionarCurso(curso);
                    }
                  }}
                >
                  Ver curso relacionado
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {vista === "journey" && (
        <section className="section">
          <h2>Customer Journey Maps</h2>
          <p className="subtitle">
            La web contempla recorridos desde redes sociales y desde búsqueda
            orgánica/pagada.
          </p>

          <div className="journey">
            <div>
              <h3>Caso A: Instagram Ads</h3>
              <ol>
                <li>El usuario ve un anuncio visual del curso.</li>
                <li>
                  Hace clic y entra a una landing optimizada para móviles.
                </li>
                <li>Revisa módulos, beneficios y promoción.</li>
                <li>Se registra o abandona el formulario.</li>
                <li>
                  El sistema permite recuperación mediante email marketing.
                </li>
                <li>Finaliza el curso y comparte su certificado.</li>
              </ol>
            </div>

            <div>
              <h3>Caso B: Google Search / SEO</h3>
              <ol>
                <li>El usuario busca cursos técnicos en Google.</li>
                <li>Encuentra un artículo del blog posicionado por SEO.</li>
                <li>Lee el contenido y llega al curso relacionado.</li>
                <li>Compara temario, precio, requisitos y docente.</li>
                <li>Completa el registro y avanza al pago.</li>
              </ol>
            </div>
          </div>
        </section>
      )}

      {vista === "registro" && (
        <section className="section">
          <h2>Registro de alumno</h2>
          <p className="subtitle">
            El formulario permite captar leads. Puede generar un código DEMO
            gratuito o un código PAGO pendiente de confirmación.
          </p>

          <form className="form" onSubmit={enviarRegistro}>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formulario.nombre}
              onChange={manejarCambio}
            />

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formulario.email}
              onChange={manejarCambio}
            />

            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={formulario.telefono}
              onChange={manejarCambio}
            />

            <select
              name="curso"
              value={formulario.curso}
              onChange={manejarCambio}
            >
              <option value="">Seleccioná un curso</option>
              {cursos.map((curso) => (
                <option key={curso.id_curso} value={curso.nombre}>
                  {curso.nombre}
                </option>
              ))}
            </select>

            <select
              name="fuenteTrafico"
              value={formulario.fuenteTrafico}
              onChange={manejarCambio}
            >
              <option value="Instagram Ads">Instagram Ads</option>
              <option value="Google Search / SEO">Google Search / SEO</option>
              <option value="Email Marketing">Email Marketing</option>
              <option value="Directo">Directo</option>
            </select>

            <div className="radio-box">
              <label>
                <input
                  type="radio"
                  name="tipoRegistro"
                  value="gratis"
                  checked={formulario.tipoRegistro === "gratis"}
                  onChange={manejarCambio}
                />
                Acceso gratuito con código DEMO
              </label>

              <label>
                <input
                  type="radio"
                  name="tipoRegistro"
                  value="pago"
                  checked={formulario.tipoRegistro === "pago"}
                  onChange={manejarCambio}
                />
                Inscripción con pago pendiente
              </label>
            </div>

            <button type="submit">Generar registro</button>
          </form>

          {mensaje && <p className="message">{mensaje}</p>}
        </section>
      )}

      {vista === "login" && (
        <section className="section">
          <h2>Ingreso al aula virtual</h2>
          <p className="subtitle">
            Ingresá el código recibido. Los códigos pendientes de pago no
            permiten entrar hasta que el administrador confirme la matrícula.
          </p>

          <form className="form" onSubmit={ingresarConCodigo}>
            <input
              type="text"
              placeholder="Ejemplo: DEMO-REACTYNO-4582"
              value={codigoLogin}
              onChange={(e) => setCodigoLogin(e.target.value)}
            />

            <button type="submit">Ingresar</button>
          </form>

          {mensaje && <p className="message">{mensaje}</p>}
        </section>
      )}

      {vista === "aula" && usuarioActivo && (
        <section className="section aula">
          <div className="aula-header">
            <div>
              <h2>Aula virtual</h2>
              <p>
                Bienvenido/a, <strong>{usuarioActivo.nombre}</strong>
              </p>
            </div>

            <button className="danger" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>

          <div className="dashboard">
            <div className="panel large">
              <h3>{usuarioActivo.curso}</h3>
              <p>
                Profesor: <strong>{cursoDelUsuario?.profesor}</strong>
              </p>
              <p>
                Modalidad: <strong>{cursoDelUsuario?.modalidad}</strong>
              </p>

              <div className="bar">
                <div style={{ width: `${usuarioActivo.progreso}%` }}></div>
              </div>

              <span>{usuarioActivo.progreso}% de avance</span>
            </div>

            <div className="panel">
              <h3>Código</h3>
              <p>{usuarioActivo.codigo_acceso}</p>
              <span className="status">{usuarioActivo.estado}</span>
            </div>

            <div className="panel">
              <h3>Certificado</h3>
              <p>Disponible al completar el 100% del curso.</p>
            </div>
          </div>

          <div className="aula-content">
            <div>
              <h3>Material de estudio</h3>

              {materiales.map((material) => (
                <div className="material" key={material.id_material}>
                  <div>
                    <strong>{material.modulo}</strong>
                    <p>{material.titulo}</p>
                  </div>
                  <span>{material.tipo}</span>
                  <em>{material.estado}</em>
                </div>
              ))}
            </div>

            <div>
              <h3>Compañeros</h3>

              <div className="mates">
                {companeros.map((compa, index) => (
                  <p key={index}>{compa}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {vista === "admin" && (
        <section className="section">
          <h2>Panel administrativo y analítica</h2>
          <p className="subtitle">
            Simula el control de inscripciones, pagos, códigos y métricas de
            campaña.
          </p>

          <div className="kpis">
            <div>
              <h3>{resumen?.total_usuarios || 0}</h3>
              <p>Usuarios registrados</p>
            </div>

            <div>
              <h3>{resumen?.registros_gratis || 0}</h3>
              <p>Códigos DEMO</p>
            </div>

            <div>
              <h3>{resumen?.pagos_pendientes || 0}</h3>
              <p>Pagos pendientes</p>
            </div>

            <div>
              <h3>{resumen?.accesos_habilitados || 0}</h3>
              <p>Accesos habilitados</p>
            </div>
          </div>

          <h3 className="admin-title">Métricas de campaña</h3>

          <div className="metrics">
            {metricas.map((metrica) => (
              <div key={metrica.id_metrica} className="metric">
                <strong>{metrica.canal}</strong>
                <p>{metrica.etapa}</p>
                <span>
                  {metrica.kpi}: {metrica.valor}
                </span>
                <em>{metrica.herramienta}</em>
              </div>
            ))}
          </div>

          <h3 className="admin-title">Usuarios registrados</h3>

          <div className="table-box">
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Email</th>
                  <th>Curso</th>
                  <th>Fuente</th>
                  <th>Tipo</th>
                  <th>Código</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.curso}</td>
                    <td>{usuario.fuente_trafico}</td>
                    <td>{usuario.tipo_registro}</td>
                    <td>{usuario.codigo_acceso}</td>
                    <td>{usuario.estado}</td>
                    <td>
                      {usuario.estado === "Pendiente de pago" ? (
                        <button
                          onClick={() => confirmarPago(usuario.id_usuario)}
                        >
                          Confirmar pago
                        </button>
                      ) : (
                        <span className="status">Habilitado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mensaje && <p className="message">{mensaje}</p>}
        </section>
      )}

      <footer>
        <p>© 2026 Tech Academy - Plataforma educativa tecnológica</p>
      </footer>
    </div>
  );
}

export default App;
