import { Traductor } from "../translate";

export function guardarComoPython(listaTokens) {
  const traductor = new Traductor(listaTokens);
  const codigoPython = traductor.traducir();

  const blob = new Blob([codigoPython], { type: 'text/x-python' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = 'codigo_traducido.py';
  enlace.click();

  return `<p>Archivo Python generado y descargado correctamente.</p>`;
}
function generarReporte(tokens) {
  const equipos = {};
  const jugadores = {};
  const partidos = [];

  // Extraer datos desde los tokens
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.tipo === 'cadena' && tokens[i - 1]?.valor === 'equipo') {
      const nombreEquipo = token.valor;
      equipos[nombreEquipo] = { nombre: nombreEquipo, goles: 0, puntos: 0 };
    }

    if (token.tipo === 'cadena' && tokens[i - 1]?.valor === 'jugador') {
      const nombreJugador = token.valor;
      jugadores[nombreJugador] = { nombre: nombreJugador, goles: 0 };
    }

    if (token.valor === 'resultado') {
      const resultado = tokens[i + 1]?.valor;
      const [goles1, goles2] = resultado.split('-').map(Number);
      const equipo1 = tokens[i - 5]?.valor;
      const equipo2 = tokens[i - 3]?.valor;

      partidos.push({ equipo1, equipo2, goles1, goles2 });

      // Asignar puntos
      if (goles1 > goles2) equipos[equipo1].puntos += 3;
      else if (goles1 < goles2) equipos[equipo2].puntos += 3;
      else {
        equipos[equipo1].puntos += 1;
        equipos[equipo2].puntos += 1;
      }

      equipos[equipo1].goles += goles1;
      equipos[equipo2].goles += goles2;
    }

    if (token.valor === 'goleadores') {
      let j = i + 2;
      while (tokens[j]?.valor !== ']') {
        const nombre = tokens[j]?.valor;
        if (jugadores[nombre]) jugadores[nombre].goles += 1;
        j += 2;
      }
    }
  }

  const htmlPosiciones = generarTablaPosiciones(equipos);
  const htmlJugadores = generarTablaJugadores(jugadores);
  const htmlEquipos = generarTablaEquipos(equipos);
  const htmlEliminacion = eliminacion(equipos)

  document.getElementById('reportePosiciones').innerHTML = htmlPosiciones;
  document.getElementById('reporteJugadores').innerHTML = htmlJugadores;
  document.getElementById('reporteEquipos').innerHTML = htmlEquipos;
  document.getElementById('reporteEquipos').innerHTML = htmlEliminacion;
}

export function generarTablaTokens(listaTokens) {
  const filas = listaTokens.map((token, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${token.lexema}</td>
      <td>${token.tipo}</td>
      <td>${token.linea}</td>
      <td>${token.columna}</td>
    </tr>
  `).join('');

  return `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Lexema</th>
          <th>Tipo</th>
          <th>Línea</th>
          <th>Columna</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>
  `;
}


export function generarTablaErrores(listaError) {
  const filas = listaError.map((error, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${error.lexema}</td>
      <td>${error.tipo}</td>
      <td>${error.linea}</td>
      <td>${error.columna}</td>
    </tr>
  `).join('');

  return `
    <table class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th>#</th>
          <th>Lexema</th>
          <th>Tipo</th>
          <th>Línea</th>
          <th>Columna</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>
  `;
}


