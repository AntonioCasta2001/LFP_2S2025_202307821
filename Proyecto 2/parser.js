import AnalizadorLexico from "./Analisis.js"
const analizador = new AnalizadorLexico();
analizador.analizar(entrada);
export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
        this.errors = [];
    }
    
    tokenActual() {
        return this.tokens[this.index];
    }

    avanzar() {
        this.index++;
    }
    coincidir(tipoEsperado) {
        const token = this.tokenActual();
        if (token && token.tipo === tipoEsperado) {
            this.avanzar();
            return true;
        } else {
            this.errors.push(`Se esperaba '${tipoEsperado}' en línea ${token?.linea}`);
            return false;
        }
    }

    parse() {
    console.log("Parseando...");
        while (this.index < this.tokens.length) {
            this.instruccion();
        }
        return this.errors;
    }
    instruccion() {
        const token = this.tokenActual(); // ← primero declaramos

        if (!token) return;

        if (token.tipo === "PUBLIC") {
            this.funcion();
            return;
        }

        if (["INT","DOUBLE","BOOLEAN", "CHAR"].includes(token.tipo)) {
            this.declaracion();
        } else if (token.tipo === "IDENTIFICADOR") {
            this.asignacion();
        } else if (token.tipo === "IF") {
            this.ifStatement();
        } else if (token.tipo === "WHILE") {
            this.whileStatement();
        } else if (token.tipo === "LLAVE_ABRE" && token.lexema === "{") {
            this.bloque();
        }  else if (token.tipo === "CENTINELA" && token.lexema === "#"){
            this.avanzar();
        } else {
            this.errors.push(`Instrucción inválida en línea ${token.linea}`);
            this.avanzar();
        }
    }
    declaracion() {
        this.avanzar(); // tipo
        if (!this.coincidir("IDENTIFICADOR")) return;
        if (this.tokenActual()?.lexema === "=") {
            this.avanzar();
            this.expresion();
        }
        this.coincidir("SIMBOLO"); // ;
    }
    asignacion() {
        this.avanzar(); // ID
        if (!this.coincidir("OP")) return;
        this.expresion();
        this.coincidir("SIMBOLO"); // ;
    }
    expresion() {
        this.termino();
        while (["+", "-", "*", "/"].includes(this.tokenActual()?.lexema)) {
            this.avanzar();
            this.termino();
        }
    }

    termino() {
    const token = this.tokenActual();
    if (["ENTERO", "DOUBLE", "BOOLEAN", "CHAR", "CADENA"].includes(token?.tipo)) {
        this.avanzar();
    } else {
        this.errors.push(`Expresión inválida en línea ${token?.linea}`);
        this.avanzar();
    }
}
    ifStatement() {
        this.avanzar(); // if
        this.coincidir("PARENTESIS_ABRE"); // (
        this.expresion();
        this.coincidir("PARENTESIS_CIERRA"); // )
        this.instruccion(); // cuerpo
    }
    bloque() {
        this.coincidir("LLAVE_ABRE");
        while (this.tokenActual()?.lexema !== "}") {
            this.instruccion();
        }
    }
    funcion() {
        //public class Clase:
        if (this.coincidir("PUBLIC")) {
            if (this.coincidir("CLASS")) {
                if (!this.coincidir("IDENTIFICADOR")) return;
                this.coincidir("LLAVE_ABRE");
                this.coincidir("PUBLIC");
                this.coincidir("STATIC");
                this.coincidir("VOID");
                this.coincidir("MAIN");
                this.coincidir("PARENTESIS_ABRE");
                if (this.tokenActual()?.tipo === "IDENTIFICADOR") {
                    this.avanzar(); // args
                    this.coincidir("CORCHETE_ABRE");
                    this.coincidir("CORCHETE_CIERRA");
                    this.coincidir("ARGS"); 
                }
                this.coincidir("PARENTESIS_CIERRA");
                this.bloque(); // o instrucciones dentro de la clase o función
                this.coincidir("LLAVE_CIERRA");
                this.coincidir("LLAVE_CIERRA");
            } else if (!this.coincidir("CLASS")) {
                this.errors.push("Se esperaba 'class' después de 'public'");
                return;
            }
        }
    }
}
