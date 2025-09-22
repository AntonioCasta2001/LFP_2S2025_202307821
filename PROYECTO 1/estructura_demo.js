
import { AnalizadorLexicoTorneos } from './parse_demo';
import fs from 'fs';


//lectura archivo
const textoPrueba = fs.readFileSync('./ArchvoPruebas.txt', 'utf-8');



const analizador = new AnalizadorLexicoTorneos();
analizador.analizar(textoPrueba);


// Paso 2: Generar todas las estructuras a partir de los tokens
const estructuras = generarEstructuras(analizador.listaTokens);




// Función principal 
function generarEstructuras(listaTokens) {
  const estructuras = {
    torneo: [],//crearTorneoVacio(),
    equipos: [],
    eliminacion: []//crearEliminacionVacia()
  };

  let i = 0;
  while (i < listaTokens.length) {
    const token = listaTokens[i];
    
    switch (token.tipo) {

      case "EQUIPOS":
        i = procesarSeccionEquipos(listaTokens, i, estructuras.equipos);
        break;

      case "CENTINELA":
        console.log("Análisis completado");
        return estructuras;
      default:
        i++;
    }
  }
  
  return estructuras;
}

//  Procesar secciones


function procesarSeccionEquipos(tokens, indice, equiposArray) {
  let i = indice + 2; // Saltar EQUIPOS {
  
  while (i < tokens.length && tokens[i].tipo !== "LLAVE_CIERRA") {
    if (tokens[i].tipo === "EQUIPO") {
      const { equipo, siguienteIndice } = procesarEquipo(tokens, i);
      equiposArray.push(equipo);
      i = siguienteIndice;
    } else if (esTokenSeccion(tokens[i].tipo)) {
      return i - 1;
    } else {
      i++;
    }
  }
  
  return i;
}


// Procesar entidades 

function procesarEquipo(tokens, indice) {
  const equipo = crearEquipoVacio();
  let i = indice;
  
  // Obtener nombre del equipo
  if (tokens[i].tipo === "EQUIPO") {
    equipo.name = obtenerValorCadena(tokens, i);
    i += 4; // Saltar equipo : "nombre" [
  }
  
  // Procesar jugadores
  const jugadores = [];
  while (i < tokens.length && tokens[i].tipo !== "CORCHETE_CIERRA") {
    if (tokens[i].tipo === "JUGADOR") {
      const { jugador, siguienteIndice } = procesarJugador(tokens, i);
      jugadores.push(jugador);
      i = siguienteIndice;
    } else {
      i++;
    }
  }
  
  equipo.jugadores = jugadores;
  return { equipo, siguienteIndice: i + 1 };
}

function procesarJugador(tokens, indice) {
  const jugador = crearJugadorVacio();
  let i = indice;
  
  // Nombre del jugador
  if (tokens[i].tipo === "JUGADOR") {
    jugador.nombre = obtenerValorCadena(tokens, i);
    i += 4; // Saltar jugador : "nombre" [
  }
  
  // Propiedades del jugador
  while (i < tokens.length && tokens[i].tipo !== "CORCHETE_CIERRA") {
    switch (tokens[i].tipo) {
      case "POSICION":
        jugador.posicion = obtenerValorCadena(tokens, i);
        i += 3;
        break;
      case "NUMERO_PROP":
        jugador.numero = parseInt(obtenerValorCadena(tokens, i));
        i += 3;
        break;
      case "EDAD":
        jugador.edad = parseInt(obtenerValorCadena(tokens, i));
        i += 3;
        break;
      default:
        i++;
    }
  }
  
  return { jugador, siguienteIndice: i + 1 };
}

function procesarFaseEliminacion(tokens, indice, faseArray) {
  let i = indice + 2; // Saltar FASE : [
  
  while (i < tokens.length && tokens[i].tipo !== "CORCHETE_CIERRA") {
    if (tokens[i].tipo === "PARTIDO") {
      const { partido, siguienteIndice } = procesarPartido(tokens, i);
      faseArray.push(partido);
      i = siguienteIndice;
    } else {
      i++;
    }
  }
  
  return i + 1;
}




//AUXILIARES
function obtenerValorCadena(tokens, indice) {
  const valorToken = tokens[indice + 2];
  return valorToken ? valorToken.lexema.replace(/"/g, '') : '';
}

function esTokenSeccion(tipo) {
  return ['TORNEO', 'EQUIPOS', 'ELIMINACION', 'CENTINELA'].includes(tipo);
}


//  OBJETOS 
function crearTorneoVacio() {
  return {
    name: "",
    equipos: 0,
    sede: ""
  };
}

function crearEquipoVacio() {
  return {
    name: "",
    jugadores: []
  };
}

function crearJugadorVacio() {
  return {
    nombre: "",
    numero: 0,
    edad: 0,
    posicion: ""
  };
}

function crearEliminacionVacia() {
  return {
    octavos: [],
    cuartos: [],
    semifinal: [],
    final: []
  };
}

function crearPartidoVacio() {
  return {
    partido: "",
    resultado: "",
    goleadores: []
  };
}

function crearGoleadorVacio() {
  return {
    jugador: "",
    minuto: 0
  };
}









// Paso 3: Mostrar solo la estructura de EQUIPOS
console.log('Estructura de EQUIPOS:', JSON.stringify(estructuras.equipos, null, 2));
