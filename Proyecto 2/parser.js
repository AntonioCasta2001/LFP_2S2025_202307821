import { AnalizadorLexico } from "./Analisis.js";

const scanner = new AnalizadorLexico();

let entrada = ` public class Clase{
    public static void main(String[] args){
        int x = 2+2;
        int y = 4;
        char z = "David";
        double c = 46.2;
        double y = 54.4;
        char v = 'a';
        if(n = 2){
            x = 46;
        }
        while(n==1){
        
        }
        for(int i =0; ){
        }
    }
}
`;
let analisis = scanner.analizar(entrada);

scanner.imprimirTokens();
scanner.imprimirErrores();

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
        const token = this.tokenActual();

        if (!token) return;

        if (token.tipo === "PUBLIC") {
            this.funcion();
            return;
        }

        if (["INT", "BOOLEAN", "CHAR"].includes(token.tipo)) {
            this.declaracion();
        } else if (token.tipo === "DOUBLE") {
            this.declaracionBoolean();
        } else if (token.tipo === "IDENTIFICADOR") {
            this.asignacion();
        } else if (token.tipo === "COMENTARIO") {
            this.avanzar(); // ignorar comentario
        } else if (token.tipo === "IF") {
            this.ifStatement();
        } else if (token.tipo === "WHILE") {
            this.whileStatement();
        } else if (token.tipo === "FOR") {
            this.forStatement();
        } else if (token.tipo === "LLAVE_ABRE" && token.lexema === "{") {
            this.bloque();
        } else if (token.tipo === "CENTINELA" && token.lexema === "#") {
            this.avanzar();
        } else {
            this.errors.push(`Instrucción inválida en línea ${token.linea} ${token.columna}`);
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
        this.coincidir("P&C"); // ;
    }
    declaracionBoolean() {
        this.avanzar();
        if (!this.coincidir("IDENTIFICADOR")) return;
        if (this.tokenActual()?.lexema === "=") {
            this.avanzar();
            this.expresion();
            this.coincidir("PUNTO");
            this.expresion();
        }
        this.coincidir("P&C");
    }
    asignacion() {
        this.avanzar(); // ID
        if (!this.coincidir("OP")) return;
        this.expresion();
        this.coincidir("P&C"); // ;
    }
    expresion() {
        this.termino();
        while (["+", "-", "*", "/", "==", "!=", "<", ">", "<=", ">=", "++", "--"].includes(this.tokenActual()?.lexema)) {
            this.avanzar();
            this.termino();
        }
    }
    condicionFor() {
        const token = this.tokenActual();
        if (this.coincidir("INT")) {
            this.avanzar();
            this.coincidir("IDENTIFICADOR");
            this.avanzar();
            this.coincidir("OPC");
            this.avanzar();
            this.coincidir("ENTERO");
            this.coincidir("P&C");

        }
    }
    condicion() {
        const token = this.tokenActual();
        if (this.coincidir("IDENTIFICADOR")) {
            if (["==", "!=", "<", ">", "<=", ">="].includes(this.tokenActual()?.lexema)) {
                this.avanzar();
                if (this.coincidir("ENTERO") || this.coincidir("CADENA") || this.coincidir("BOOLEAN") || this.coincidir("IDENTIFICADOR")) {
                    this.avanzar();
                }
            }
        } else {
            this.errors.push(`Condicion de if inválida en línea ${token?.linea}`);
            this.avanzar();
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
        this.condicion();
        this.instruccion(); // cuerpo
        this.coincidir("LLAVE_CIERRA");
    }
    whileStatement() {
        this.avanzar();
        this.coincidir("PARENTESIS_ABRE"); // (
        this.condicion();
        this.instruccion(); // cuerpo
        this.coincidir("LLAVE_CIERRA");
    }
    forStatement() {
        this.avanzar();
        this.coincidir("PARENTESIS_ABRE"); // (
        this.condicionFor();
        this.instruccion(); // cuerpo
        this.coincidir("LLAVE_CIERRA");
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
                    this.avanzar();
                    this.coincidir("CORCHETE_ABRE");
                    this.coincidir("CORCHETE_CIERRA");
                    this.coincidir("ARGS");
                }
                this.coincidir("PARENTESIS_CIERRA");
                this.bloque();
                this.coincidir("LLAVE_CIERRA");
                this.coincidir("LLAVE_CIERRA");
            } else if (!this.coincidir("CLASS")) {
                this.errors.push("Se esperaba 'class' después de 'public'");
                return;
            }
        }
    }
}

const analizador = new AnalizadorLexico();
analizador.analizar(entrada);

if (analizador.listaError.length === 0) {
    const parser = new Parser(analizador.listaTokens);
    const erroresSintacticos = parser.parse();

    if (erroresSintacticos.length === 0) {
        console.log("✅ Análisis sintáctico exitoso.");
    } else {
        console.log("❌ Errores sintácticos:");
        erroresSintacticos.forEach((e, i) => console.log(`${i + 1}. ${e}`));
    }
}