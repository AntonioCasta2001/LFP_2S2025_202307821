// Ejemplo base para implementar el análisis léxico de torneos

// Estados principales del autómata:
// estado 0: inicio o esperando nuevo token
// estado 1: leyendo cadena ("texto")
// estado 2: leyendo identificador o palabra clave
// estado 3: leyendo número


class Token {
    constructor(tipo, valor, linea, columna) {
        this.tipo = tipo;
        this.valor = valor;
        this.linea = linea;
        this.columna = columna;
    }
}

// Algunas palabras clave de ejemplo:
const palabras_clave = {
    TORNEO: 'TORNEO',
    EQUIPOS: 'EQUIPOS',
    ELIMINACION: 'ELIMINACION',
    FINAL: 'FINAL',
    PARTIDO: 'PARTIDO'
};

// Algunos símbolos reconocidos:
const simbolos = ['{', '}', '[', ']', ':', ','];

class AnalizadorLexicoTorneos {
  constructor() {
    this.palabras_clave = {
      TORNEO: 'TORNEO',
      EQUIPOS: 'EQUIPOS',
      ELIMINACION: 'ELIMINACION',
      FINAL: 'FINAL',
      PARTIDO: 'PARTIDO'
    };

    this.simbolos = ['{', '}', '[', ']', ':', ','];
  }

  analizar(entrada) {
    let estado = 0;
    let buffer = '';
    let index = 0;
    let lista_tokens = [];

    while (index < entrada.length) {
      const char = entrada[index];

      if (estado === 0) {
        if (this.simbolos.includes(char)) {
          lista_tokens.push(new Token('simbolo', char, index));
        } else if (char === '"') {
          buffer = '';
          estado = 1;
        } else if (/[a-zA-Z_]/.test(char)) {
          buffer = char;
          estado = 2;
        } else if (/\d/.test(char)) {
          buffer = char;
          estado = 3;
        } else if (/\s/.test(char)) {
          // Ignorar espacios
        } else {
          console.error(`Error léxico en posición ${index}: carácter inesperado '${char}'`);
        }
      }

      else if (estado === 1) {
        if (char !== '"') {
          buffer += char;
        } else {
          lista_tokens.push(new Token('cadena', buffer, index));
          estado = 0;
        }
      }

      else if (estado === 2) {
        if (/[a-zA-Z0-9]/.test(char)) {
          buffer += char;
        } else {
          const palabra = buffer.toUpperCase();
          if (this.palabras_clave[palabra]) {
            lista_tokens.push(new Token('palabra_clave', palabra, index));
          } else {
            lista_tokens.push(new Token('identificador', buffer, index));
          }
          estado = 0;
          continue;
        }
      }

      else if (estado === 3) {
        if (/\d/.test(char)) {
          buffer += char;
        } else {
          lista_tokens.push(new Token('numero', buffer, index));
          estado = 0;
          continue;
        }
      }

      index++;
    }

    // Finalizar buffers si quedaron abiertos
    if (estado === 2) {
      const palabra = buffer.toUpperCase();
      if (this.palabras_clave[palabra]) {
        lista_tokens.push(new Token('palabra_clave', palabra, index));
      } else {
        lista_tokens.push(new Token('identificador', buffer, index));
      }
    }

    if (estado === 3) {
      lista_tokens.push(new Token('numero', buffer, index));
    }

    return lista_tokens;
  }
}


const entrada = 'TORNEO { EQUIPOS: 4, PARTIDOS: "Final"}';
const analizador = new AnalizadorLexicoTorneos();
const tokens = analizador.analizar(entrada)
console.log(tokens);

