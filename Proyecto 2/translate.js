import { Parser } from "./parser.js";
import { AnalizadorLexico } from "./Analisis.js";

let entrada = ` public class Clase{
    public static void main(String[] args){
        int x = 2+2;
        int y = 4;
        char z = "David";
        double c = 46.2;
        double y = 54.4;
        char v = 'a';
        if(n != 2){
            x = 46;
        }
        while(n==1){
        
        }
        for(){
        }
    }
}
`;
const analizador = new AnalizadorLexico();
analizador.analizar(entrada);

export class Traductor {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
        this.codigoPython = "";
        this.indentacion = 0;
    }

    traducir() {
        while (this.index < this.tokens.length) {
            this.instruccion();
        }
        return this.codigoPython.trim();
    }

    instruccion() {
        const token = this.tokenActual();
        if (!token) return;

        // Ignorar encabezados y palabras clave no traducibles
        if (["PUBLIC", "STATIC", "VOID", "CLASS"].includes(token.tipo) || ["public", "static", "void", "class"].includes(token.lexema)) {
            while (this.tokenActual() && this.tokenActual().lexema !== "{") this.avanzar();
            this.avanzar(); // saltar la llave de apertura
            return;
        }

        // Ignorar llaves de apertura/cierre
        if (token.lexema === "{" || token.lexema === "}") {
            this.avanzar();
            return;
        }

        // Declaración con tipo: int x = 5;
        if (["INT", "FLOAT", "BOOLEAN"].includes(token.tipo)) {
            this.declaracion();
            return;
        }

        // Asignación simple: x = 5;
        if (token.tipo === "IDENTIFICADOR" && this.tokens[this.index + 1]?.lexema === "=") {
            this.asignacion();
            return;
        }

        // Ciclo while
        if (token.tipo === "WHILE") {
            this.whileStatement();
            return;
        }

        // Condicional if
        if (token.tipo === "IF") {
            this.ifStatement();
            return;
        }

        // Bloque explícito
        if (token.tipo === "SIMBOLO" && token.lexema === "{") {
            this.bloque();
            return;
        }

        // Si no coincide con nada, avanzar
        this.avanzar();
    }

    declaracion() {
        this.avanzar(); // tipo
        const nombre = this.tokenActual()?.lexema;
        this.avanzar(); // identificador

        let valor = "None";
        if (this.tokenActual()?.lexema === "=") {
            this.avanzar(); // =
            valor = this.expresion();
        }

        this.avanzar(); // ;
        this.escribir(`${nombre} = ${valor}`);
    }

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
        while (this.tokenActual() && this.tokenActual().tipo !== "SIMBOLO" && this.tokenActual().lexema !== ";") {
            resultado += this.tokenActual().lexema + " ";
            this.avanzar();
        }
        return resultado.trim();
    }
    expresionCondicion() {
        let resultado = "";
        while (this.tokenActual() && this.tokenActual().tipo !== "SIMBOLO" && this.tokenActual().lexema !== ";") {
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
    forStatement(){
                // Traducir como while
        this.escribir(`while ${condicion}:`);
        this.indentacion++;
        this.bloque(); // cuerpo del for
        this.escribir(incremento); // ejecutar incremento al final del cuerpo
        this.indentacion--;
    }
    ifStatement() {
        this.avanzar(); // if
        this.avanzar(); // (
        const condicion = this.expresion();
        this.avanzar(); // )
        //this.avanzar(); // )
        if (this.tokenActual() && this.tokenActual().tipo !== "PARENTESIS_CIERRA") { }
        this.escribir(`if ${condicion}:`);
        this.bloque();
    }

    bloque() {
        this.avanzar(); // {
        this.indentacion++;
        while (this.tokenActual() && this.tokenActual().lexema !== "}") {
            this.instruccion();
        }
        this.indentacion--;
        this.avanzar(); // }
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

export function ejecutarTraduccion(codigoFuente) {
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
