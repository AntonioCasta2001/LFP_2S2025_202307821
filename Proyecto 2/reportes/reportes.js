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
export function generarTablaPosiciones(equipos) {
  const ordenados = Object.values(equipos).sort((a, b) => b.puntos - a.puntos);
  let html = `<table><tr><th>Equipo</th><th>Puntos</th><th>Goles</th></tr>`;
  ordenados.forEach(e => {
    html += `<tr><td>${e.nombre}</td><td>${e.puntos}</td><td>${e.goles}</td></tr>`;
  });
  html += `</table>`;
  return html;
}

export function extraerGoleadores(tokens) {
  const goleadores = {};

  let equipoActual = "";
  let jugadorActual = "";

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Detectar equipo actual
    if (token.lexema?.toLowerCase() === 'equipo') {
      const equipoToken = tokens[i + 1];
      if (equipoToken?.tipo === 'cadena') {
        equipoActual = equipoToken.lexema.replace(/"/g, '');
      }
    }

    if (token.lexema?.toLowerCase() === 'goleador') {
      const nombreToken = tokens[i + 1];
      if (nombreToken?.tipo === 'cadena') {
        jugadorActual = nombreToken.lexema.replace(/"/g, '');

        if (!goleadores[jugadorActual]) {
          goleadores[jugadorActual] = {
            nombre: jugadorActual,
            equipo: equipoActual,
            goles: 0,
            minutos: []
          };
        }

        goleadores[jugadorActual].goles += 1;
      }
    }

    if (token.lexema?.toLowerCase() === 'minuto') {
      const minutoToken = tokens[i + 1];
      if (minutoToken?.tipo === 'numero' || minutoToken?.tipo === 'cadena') {
        const minuto = minutoToken.lexema.replace(/"/g, '');
        if (goleadores[jugadorActual]) {
          goleadores[jugadorActual].minutos.push(minuto);
        }
      }
    }
  }

  return Object.values(goleadores);
}
export function generarTablaGoleadores(goleadores) {
  const ordenados = goleadores.sort((a, b) => b.goles - a.goles);

  const filas = ordenados.map((g, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${g.nombre}</td>
      <td>${g.equipo}</td>
      <td>${g.goles}</td>
      <td>${g.minutos.map(m => `${m}'`).join(', ')}</td>
    </tr>
  `).join('');

  return `
    <h5>Reporte de Goleadores</h5>
    <p>Ranking de los jugadores que más goles han anotado en el torneo.</p>
    <table class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th>Posición</th>
          <th>Jugador</th>
          <th>Equipo</th>
          <th>Goles</th>
          <th>Minutos de Gol</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>
  `;
}
export function eliminacion(listaTokens) {
  const fases = {
    CUARTOS: "Cuartos de Final",
    SEMIFINAL: "Semifinal",
    FINAL: "Final",
    OCTAVOS: "Octavos"
  };

  const partidos = [];
  let faseActual = "";
  let equipo1 = "", equipo2 = "", resultado = "", ganador = "";

  for (let i = 0; i < listaTokens.length; i++) {
    const token = listaTokens[i];

    if (token.tipo === 'palabra_clave' && fases[token.lexema]) {
      faseActual = fases[token.lexema];
    }

    if (token.lexema?.toLowerCase() === 'partido') {
      let equipos = [];
      let j = i + 1;
      while (j < listaTokens.length && equipos.length < 2) {
        const t = listaTokens[j];
        if (t.tipo === 'cadena') {
          equipos.push(t.lexema.replace(/"/g, ''));
        }
        j++;
      }
      equipo1 = equipos[0] || "Equipo A";
      equipo2 = equipos[1] || "Equipo B";
    }

    if (token.lexema?.toLowerCase() === 'resultado') {
      const resultadoToken = listaTokens[i + 1];
      resultado = resultadoToken?.lexema.replace(/"/g, '') || "Pendiente";

      const [g1, g2] = resultado.split('-').map(Number);
      if (!isNaN(g1) && !isNaN(g2)) {
        ganador = g1 > g2 ? equipo1 : g2 > g1 ? equipo2 : "Empate";
      } else {
        resultado = "Pendiente";
        ganador = "-";
      }
      partidos.push({
        fase: faseActual,
        equipo1,
        equipo2,
        resultado,
        ganador
      });

      // Reset temporal
      equipo1 = ""; equipo2 = ""; resultado = ""; ganador = "";
    }
  }

  return partidos;
}

export function tablaeliminacion(partidos) {
  const filas = partidos.map((p, index) => `
    <tr>
      <td>${p.fase}</td>
      <td>${p.equipo1} vs ${p.equipo2}</td>
      <td>${p.resultado || 'Pendiente'}</td>
      <td>${p.ganador || '-'}</td>
    </tr>
  `).join('');

  return `
    <table class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th>Fase</th>
          <th>Partido</th>
          <th>Resultado</th>
          <th>Ganador</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>
  `;
}

