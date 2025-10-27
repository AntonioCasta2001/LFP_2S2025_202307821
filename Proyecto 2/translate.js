import Parser from "./parser.js"
import { AnalizadorLexico } from "./Analisis.js";


class Traductor {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
        this.codigoPython = "";
        this.indentacion = 0;
    }

    declaracion() {
        this.avanzar(); // tipo
        const nombre = this.tokenActual()?.lexema;
        this.avanzar(); // identificador

        let valor = "None";
        if (this.tokenActual()?.lexema === "=") {
            this.avanzar();
            valor = this.expresion();
        }

        this.avanzar(); // ;
        this.escribir(`${nombre} = ${valor}`);
    };

    asignacion() {
        const nombre = this.tokenActual()?.lexema;
        this.avanzar(); // identificador
        this.avanzar(); // =
        const valor = this.expresion();
        this.avanzar(); // ;
        this.escribir(`${nombre} = ${valor}`);
    }
    expresion() {
        let resultado = "";
        while (this.tokenActual() && this.tokenActual().tipo !== "SYM") {
            resultado += this.tokenActual().lexema + " ";
            this.avanzar();
        }
        return resultado.trim();
    }
    whileStatement() {
        this.avanzar(); // while
        this.avanzar(); // (
        const condicion = this.expresion();
        this.avanzar(); // )
        this.escribir(`while ${condicion}:`);
        this.bloque();
    }
    bloque() {
        this.avanzar(); // {
        this.indentacion++;
        while (this.tokenActual()?.lexema !== "}") {
            this.instruccion();
        }
        this.indentacion--;
        this.avanzar(); // }
    }
    instruccion() {
        const token = this.tokenActual();
        if (!token) return;

        if (["INT", "FLOAT", "BOOLEAN"].includes(token.tipo)) {
            this.declaracion();
        } else if (token.tipo === "IDENTIFICADOR") {
            this.asignacion();
        } else if (token.tipo === "IF") {
            this.ifStatement();
        } else if (token.tipo === "WHILE") {
            this.whileStatement();
        } else if (token.tipo === "SYM" && token.lexema === "{") {
            this.bloque();
        } else {
            this.avanzar(); // ignorar token no traducible
        }
    }
    traducir() {
        while (this.index < this.tokens.length) {
            this.instruccion();
        }
        return this.codigoPython;
    }

    tokenActual() {
        return this.tokens[this.index];
    }

    avanzar() {
        this.index++;
    }

    escribir(linea) {
        this.codigoPython += "    ".repeat(this.indentacion) + linea + "\n";
    }
}


const traductor = new Traductor(analizador.listaTokens);
const codigoPython = traductor.traducir();
console.log("Código Python generado:\n", codigoPython);

function ejecutarTraduccion(codigoFuente) {
  const analizador = new AnalizadorLexico();
  analizador.analizar(codigoFuente);

  if (analizador.listaError.length > 0) {
    return {
      erroresLexicos: analizador.listaError,
      erroresSintacticos: [],
      codigoPython: "",
      tokens: analizador.listaTokens
    };
  }

  const parser = new Parser(analizador.listaTokens);
  const erroresSintacticos = parser.parse();

  if (erroresSintacticos.length > 0) {
    return {
      erroresLexicos: [],
      erroresSintacticos,
      codigoPython: "",
      tokens: analizador.listaTokens
    };
  }

  const traductor = new Traductor(analizador.listaTokens);
  const codigoPython = traductor.traducir();

  return {
    erroresLexicos: [],
    erroresSintacticos: [],
    codigoPython,
    tokens: analizador.listaTokens
  };
}
