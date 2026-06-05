import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const cursos = [
    {
      id: 1,
      nombre: "HTML, CSS y JavaScript",
      descripcion: "Aprendé a crear páginas web modernas desde cero.",
      duracion: "8 semanas",
      modalidad: "Online",
      precio: "$25.000",
      profesor: "Lucía Fernández",
      promo: "Primera clase gratis",
      nivel: "Inicial",
    },
    {
      id: 2,
      nombre: "React y Node.js",
      descripcion: "Creá aplicaciones web dinámicas con tecnologías actuales.",
      duracion: "12 semanas",
      modalidad: "Online",
      precio: "$40.000",
      profesor: "Martín Gómez",
      promo: "25% OFF",
      nivel: "Intermedio",
    },
    {
      id: 3,
      nombre: "Base de Datos SQL",
      descripcion: "Aprendé consultas, tablas, relaciones y gestión de datos.",
      duracion: "6 semanas",
      modalidad: "Online",
      precio: "$30.000",
      profesor: "Carolina Ríos",
      promo: "Certificación incluida",
      nivel: "Inicial",
    },
  ];

  const materiales = [
    {
      id: 1,
      modulo: "Módulo 1",
      titulo: "Introducción al curso",
      tipo: "Video clase",
      estado: "Disponible",
    },
    {
      id: 2,
      modulo: "Módulo 2",
      titulo: "Material de lectura",
      tipo: "PDF",
      estado: "Disponible",
    },
    {
      id: 3,
      modulo: "Módulo 3",
      titulo: "Actividad práctica",
      tipo: "Trabajo práctico",
      estado: "Pendiente",
    },
    {
      id: 4,
      modulo: "Módulo 4",
      titulo: "Evaluación final",
      tipo: "Cuestionario",
      estado: "Bloqueado",
    },
  ];

  const compañeros = [
    "Tomas Vega",
    "Franco Benitez",
    "Facundo Cristaldo",
    "Sofía Martínez",
    "Nicolás Acosta",
  ];

  const [usuarios, setUsuarios] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [vista, setVista] = useState("inicio");
  const [mensaje, setMensaje] = useState("");
  const [codigoLogin, setCodigoLogin] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    curso: "",
    tipoRegistro: "gratis",
  });

  useEffect(() => {
    const usuariosGuardados = localStorage.getItem("usuariosTechAcademy");

    if (usuariosGuardados) {
      setUsuarios(JSON.parse(usuariosGuardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("usuariosTechAcademy", JSON.stringify(usuarios));
  }, [usuarios]);

  const generarCodigo = (curso, tipoRegistro) => {
    const cursoCorto = curso
      .toUpperCase()
      .replaceAll(" ", "")
      .replaceAll(",", "")
      .slice(0, 8);

    const numero = Math.floor(1000 + Math.random() * 9000);

    if (tipoRegistro === "gratis") {
      return `DEMO-${cursoCorto}-${numero}`;
    }

    return `PAGO-${cursoCorto}-${numero}`;
  };

  const seleccionarCurso = (curso) => {
    setCursoSeleccionado(curso);
    setFormulario({
      ...formulario,
      curso: curso.nombre,
    });
    setVista("registro");
    setMensaje("");
  };

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const enviarRegistro = (e) => {
    e.preventDefault();

    if (
      formulario.nombre.trim() === "" ||
      formulario.email.trim() === "" ||
      formulario.telefono.trim() === "" ||
      formulario.curso.trim() === ""
    ) {
      setMensaje("Por favor, completá todos los campos.");
      return;
    }

    const codigoGenerado = generarCodigo(
      formulario.curso,
      formulario.tipoRegistro,
    );

    const nuevoUsuario = {
      id: Date.now(),
      nombre: formulario.nombre,
      email: formulario.email,
      telefono: formulario.telefono,
      curso: formulario.curso,
      tipoRegistro: formulario.tipoRegistro,
      codigo: codigoGenerado,
      estado:
        formulario.tipoRegistro === "gratis"
          ? "Acceso habilitado"
          : "Pendiente de pago",
      fechaRegistro: new Date().toLocaleDateString(),
      progreso: formulario.tipoRegistro === "gratis" ? 20 : 0,
    };

    setUsuarios([...usuarios, nuevoUsuario]);

    if (formulario.tipoRegistro === "gratis") {
      setMensaje(
        `Registro exitoso. Tu código de acceso gratuito es: ${codigoGenerado}`,
      );
    } else {
      setMensaje(
        `Registro enviado. Tu código fue generado, pero quedará pendiente hasta confirmar el pago: ${codigoGenerado}`,
      );
    }

    setFormulario({
      nombre: "",
      email: "",
      telefono: "",
      curso: "",
      tipoRegistro: "gratis",
    });

    setCursoSeleccionado(null);
  };

  const ingresarConCodigo = (e) => {
    e.preventDefault();

    const usuarioEncontrado = usuarios.find(
      (usuario) => usuario.codigo.toLowerCase() === codigoLogin.toLowerCase(),
    );

    if (!usuarioEncontrado) {
      setMensaje("El código ingresado no existe.");
      return;
    }

    if (usuarioEncontrado.estado === "Pendiente de pago") {
      setMensaje(
        "Tu inscripción existe, pero el acceso todavía está pendiente de pago.",
      );
      return;
    }

    setUsuarioActivo(usuarioEncontrado);
    setVista("aula");
    setMensaje("");
    setCodigoLogin("");
  };

  const confirmarPago = (idUsuario) => {
    const usuariosActualizados = usuarios.map((usuario) => {
      if (usuario.id === idUsuario) {
        return {
          ...usuario,
          estado: "Acceso habilitado",
          progreso: 10,
        };
      }

      return usuario;
    });

    setUsuarios(usuariosActualizados);
    setMensaje("Pago confirmado. El código de acceso quedó habilitado.");
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
    setVista("inicio");
    setMensaje("");
  };

  const cursoDelUsuario = cursos.find(
    (curso) => curso.nombre === usuarioActivo?.curso,
  );

  return (
    <div>
      <header className="header">
        <nav className="navbar">
          <h1>Tech Academy</h1>

          <ul>
            <li>
              <button onClick={() => setVista("inicio")}>Inicio</button>
            </li>
            <li>
              <button onClick={() => setVista("cursos")}>Cursos</button>
            </li>
            <li>
              <button onClick={() => setVista("registro")}>Registro</button>
            </li>
            <li>
              <button onClick={() => setVista("login")}>Ingresar</button>
            </li>
            <li>
              <button onClick={() => setVista("admin")}>Admin</button>
            </li>
          </ul>
        </nav>
      </header>

      {vista === "inicio" && (
        <>
          <section className="hero">
            <div className="hero-text">
              <span className="etiqueta">Plataforma educativa dinámica</span>

              <h2>Aprendé programación y desarrollo web desde cero</h2>

              <p>
                Registrate, recibí un código de acceso y entrá a tu aula virtual
                con materiales de estudio, profesores, compañeros y seguimiento
                de avance.
              </p>

              <div className="botones">
                <button
                  className="btn principal"
                  onClick={() => setVista("cursos")}
                >
                  Ver cursos
                </button>

                <button
                  className="btn secundario"
                  onClick={() => setVista("login")}
                >
                  Ingresar con código
                </button>
              </div>
            </div>

            <div className="publicidad">
              <h3>Campaña activa</h3>
              <p>Primera clase gratis</p>
              <strong>{usuarios.length} usuarios registrados</strong>
              <span>SEO + anuncios + aula virtual</span>
            </div>
          </section>

          <section className="seccion resumen">
            <h2>¿Cómo funciona?</h2>

            <div className="pasos">
              <div>
                <span>1</span>
                <h3>Elegís un curso</h3>
                <p>
                  El usuario llega desde Google, redes sociales o publicidad y
                  selecciona una capacitación.
                </p>
              </div>

              <div>
                <span>2</span>
                <h3>Te registrás</h3>
                <p>
                  Puede elegir acceso gratuito con código automático o registro
                  pendiente de pago.
                </p>
              </div>

              <div>
                <span>3</span>
                <h3>Ingresás al aula</h3>
                <p>
                  Con el código habilitado accede al curso, materiales,
                  profesores y compañeros.
                </p>
              </div>
            </div>
          </section>

          <section className="seccion seo">
            <h2>Aplicación del SEO</h2>

            <div className="seo-grid">
              <div>
                <h3>Posicionamiento</h3>
                <p>
                  La página utiliza títulos claros, contenido relacionado con
                  cursos de programación y estructura ordenada.
                </p>
              </div>

              <div>
                <h3>Conversión</h3>
                <p>
                  El SEO atrae visitantes interesados y los dirige hacia el
                  registro o inscripción.
                </p>
              </div>

              <div>
                <h3>Medición</h3>
                <p>
                  Se pueden medir visitas, clics, registros, códigos generados y
                  accesos al aula virtual.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {vista === "cursos" && (
        <section className="seccion">
          <h2>Cursos disponibles</h2>
          <p className="subtitulo">
            Seleccioná una capacitación para iniciar el proceso de registro.
          </p>

          <div className="contenedor-cursos">
            {cursos.map((curso) => (
              <article key={curso.id} className="card">
                <span className="promo">{curso.promo}</span>

                <h3>{curso.nombre}</h3>

                <p>{curso.descripcion}</p>

                <ul className="lista-card">
                  <li>Duración: {curso.duracion}</li>
                  <li>Modalidad: {curso.modalidad}</li>
                  <li>Nivel: {curso.nivel}</li>
                  <li>Profesor: {curso.profesor}</li>
                </ul>

                <h4>{curso.precio}</h4>

                <button onClick={() => seleccionarCurso(curso)}>
                  Inscribirme
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {vista === "registro" && (
        <section className="seccion">
          <h2>Registro de alumno</h2>

          <p className="subtitulo">
            Elegí si querés acceder a una clase gratuita o dejar tu inscripción
            pendiente hasta confirmar el pago.
          </p>

          {cursoSeleccionado && (
            <div className="detalle">
              <h3>Curso seleccionado</h3>
              <p>
                {cursoSeleccionado.nombre} - {cursoSeleccionado.precio}
              </p>
            </div>
          )}

          <form className="formulario" onSubmit={enviarRegistro}>
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
                <option key={curso.id} value={curso.nombre}>
                  {curso.nombre}
                </option>
              ))}
            </select>

            <div className="opciones-registro">
              <label>
                <input
                  type="radio"
                  name="tipoRegistro"
                  value="gratis"
                  checked={formulario.tipoRegistro === "gratis"}
                  onChange={manejarCambio}
                />
                Acceso gratuito con código automático
              </label>

              <label>
                <input
                  type="radio"
                  name="tipoRegistro"
                  value="pago"
                  checked={formulario.tipoRegistro === "pago"}
                  onChange={manejarCambio}
                />
                Inscripción pendiente de pago
              </label>
            </div>

            <button type="submit">Generar registro</button>
          </form>

          {mensaje && <p className="mensaje">{mensaje}</p>}
        </section>
      )}

      {vista === "login" && (
        <section className="seccion login">
          <h2>Ingreso al aula virtual</h2>

          <p className="subtitulo">
            Ingresá el código recibido al registrarte. Si el registro está
            pendiente de pago, el sistema no permitirá acceder todavía.
          </p>

          <form className="formulario" onSubmit={ingresarConCodigo}>
            <input
              type="text"
              placeholder="Ejemplo: DEMO-REACTYNO-4582"
              value={codigoLogin}
              onChange={(e) => setCodigoLogin(e.target.value)}
            />

            <button type="submit">Ingresar al curso</button>
          </form>

          {mensaje && <p className="mensaje">{mensaje}</p>}
        </section>
      )}

      {vista === "aula" && usuarioActivo && (
        <section className="seccion aula">
          <div className="panel-superior">
            <div>
              <h2>Aula virtual</h2>
              <p>
                Bienvenido/a, <strong>{usuarioActivo.nombre}</strong>
              </p>
            </div>

            <button className="btn-salir" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>

          <div className="aula-grid">
            <div className="bloque-aula grande">
              <h3>{usuarioActivo.curso}</h3>
              <p>
                Profesor: <strong>{cursoDelUsuario?.profesor}</strong>
              </p>
              <p>
                Modalidad: <strong>{cursoDelUsuario?.modalidad}</strong>
              </p>
              <p>
                Duración: <strong>{cursoDelUsuario?.duracion}</strong>
              </p>

              <div className="barra">
                <div
                  className="progreso"
                  style={{ width: `${usuarioActivo.progreso}%` }}
                ></div>
              </div>

              <span>{usuarioActivo.progreso}% de avance</span>
            </div>

            <div className="bloque-aula">
              <h3>Código de acceso</h3>
              <p>{usuarioActivo.codigo}</p>
              <span className="estado activo">{usuarioActivo.estado}</span>
            </div>

            <div className="bloque-aula">
              <h3>Certificado</h3>
              <p>
                El certificado estará disponible cuando completes todos los
                módulos del curso.
              </p>
            </div>
          </div>

          <div className="contenido-aula">
            <div>
              <h3>Material de estudio</h3>

              {materiales.map((material) => (
                <div key={material.id} className="material">
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

              <div className="companeros">
                {compañeros.map((compañero, index) => (
                  <p key={index}>{compañero}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {vista === "admin" && (
        <section className="seccion">
          <h2>Panel administrativo</h2>

          <p className="subtitulo">
            Este panel simula la gestión de inscripciones. En una versión real,
            estos datos se guardarían en una base de datos MySQL administrada
            desde phpMyAdmin.
          </p>

          {usuarios.length === 0 ? (
            <p className="mensaje">
              Todavía no hay usuarios registrados en la plataforma.
            </p>
          ) : (
            <div className="tabla-contenedor">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Email</th>
                    <th>Curso</th>
                    <th>Tipo</th>
                    <th>Código</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.curso}</td>
                      <td>
                        {usuario.tipoRegistro === "gratis" ? "Gratis" : "Pago"}
                      </td>
                      <td>{usuario.codigo}</td>
                      <td>{usuario.estado}</td>
                      <td>
                        {usuario.estado === "Pendiente de pago" ? (
                          <button
                            className="btn-tabla"
                            onClick={() => confirmarPago(usuario.id)}
                          >
                            Confirmar pago
                          </button>
                        ) : (
                          <span className="estado activo">Habilitado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mensaje && <p className="mensaje">{mensaje}</p>}
        </section>
      )}

      <footer>
        <p>© 2026 Tech Academy - Plataforma educativa tecnológica</p>
      </footer>
    </div>
  );
}

export default App;
