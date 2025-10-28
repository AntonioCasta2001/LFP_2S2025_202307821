class Token {
    constructor(tipo, lexema, linea, columna) {
        this.tipo = tipo;
        this.lexema = lexema;
        this.linea = linea;
        this.columna = columna;
    }
}

class Error {
    constructor(tipo, lexema, linea, columna) {
        this.tipo = tipo;
        this.lexema = lexema;
        this.linea = linea;
        this.columna = columna;
    }
}
export class AnalizadorLexico {
    constructor() {
        (this.listaTokens = []), (this.listaError = []);
    }

    palabrasReservadas(buffer) {
        const palabras_clave = {
            "public": "PUBLIC",
            "class": "CLASS",
            "static": "STATIC",
            "void": "VOID",
            "main": "MAIN",
            "string": "STRING",
            "args": "ARGS",
            "int": "INT",
            "double": "DOUBLE",
            "char": "CHAR",
            "boolean": "BOOLEAN",
            "true": "TRUE",
            "false": "FALSE",
            "if": "IF",
            "else": "ELSE",
            "while": "WHILE",
            "for": "FOR",
            "return": "RETURN",
            "system": "SYSTEM",
            "out": "OUT",
            "println": "PRINTLN"
        };
        return palabras_clave[buffer];
    }
    identificadores(char) {
        const code = char.charCodeAt(0);
        return (
            (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || "áéíóúÁÉÍÓÚñÑ".includes(char)
        );
    }

    esDigito(c) {
        const code = c.charCodeAt(0);
        return code >= 48 && code <= 57;
    }
    operadores(char) {
        const ops = ["+", "-", "*", "/", "=", "<", ">"];
        return ops.includes(char);
    }
    esOperadorCompuesto(char) {
        const ops2 = ["==", "!=", "<=", ">=", "++", "--"];
        return ops2.includes(char);
    }
    esSimbolo(char) {
        const simbolos = ["{", "}", "(", ")", "[", "]"]
        return simbolos.includes(char);
    }
    esEspacio(char) {
        return char === ' ' || char === '\t' || char === '\n' || char === '\r';
    }
    analizar(entrada) {
        this.listaTokens = [];
        this.listaError = [];
        let buffer = "";
        const centinela = "#";
        entrada += centinela;
        let linea = 1;
        let columna = 1;
        let estado = 0;
        let index = 0;

        while (index < entrada.length) {
            const char = entrada[index];

            if (estado === 0) {
                if (char === "{") {
                    columna += 1;
                    this.listaTokens.push(new Token("LLAVE_ABRE", char, linea, columna));
                } else if (char === "}") {
                    columna += 1;
                    this.listaTokens.push(
                        new Token("LLAVE_CIERRA", char, linea, columna)
                    );
                } else if (char === "[") {
                    columna += 1;
                    this.listaTokens.push(
                        new Token("CORCHETE_ABRE", char, linea, columna)
                    );
                } else if (char === "]") {
                    columna += 1;
                    this.listaTokens.push(
                        new Token("CORCHETE_CIERRA", char, linea, columna)
                    );
                } else if (char == "(") {
                    columna += 1;
                    this.listaTokens.push(
                        new Token("PARENTESIS_ABRE", char, linea, columna)
                    );
                } else if (char == ")") {
                    columna += 1;
                    this.listaTokens.push(
                        new Token("PARENTESIS_CIERRA", char, linea, columna)
                    );
                } else if (char === ":") {
                    columna += 1;
                    this.listaTokens.push(new Token("SIMBOLO", char, linea, columna));
                } else if (char === ";") {
                    columna += 1;
                    this.listaTokens.push(new Token("P&C", char, linea, columna));
                } else if (char === ",") {
                    columna += 1;
                    this.listaTokens.push(new Token("SIMBOLO", char, linea, columna));
                } else if (char === "."){
                    columna += 1;
                    this.listaTokens.push(new Token("PUNTO", char, linea, columna));
                } else if (this.esOperadorCompuesto(char) || this.operadores(char)) {
                    const dosCaracteres = entrada.slice(index, index + 2);
                    if (this.esOperadorCompuesto(dosCaracteres)) {
                        this.listaTokens.push(new Token("OPC", dosCaracteres, linea, columna));
                        index++; columna += 2;
                    } else {
                        this.listaTokens.push(new Token("OP", char, linea, columna));
                        columna++;
                    }
                }
                else if (char === '"' || char === "'") {
                    columna += 1;
                    buffer = '"';
                    estado = 1;
                } else if (this.identificadores(char)) {
                    columna += 1;
                    buffer = char;
                    estado = 2;
                } else if (this.esDigito(char)) {
                    columna += 1;
                    buffer = char;
                    estado = 3;
                } else if (this.esEspacio(char)) {
                    if (char === "\t") columna += 4;
                    else if (char === " ") columna += 1;
                    else if (char === "\n") {
                        linea += 1;
                        columna = 1;
                    }
                } else if (char === "#") {
                    console.log("Análisis del archivo completado exitosamente");
                    this.listaTokens.push(new Token("CENTINELA", char, linea, columna));
                    break;
                } else {
                    columna += 1;
                    this.listaError.push(
                        new Error("Error Léxico", char, linea, columna)
                    );
                }
            } else if (estado === 1) {
                if (char === '"') {
                    columna += 1;
                    buffer += '"';
                    this.listaTokens.push(new Token("CADENA", buffer, linea, columna));
                    buffer = "";
                    estado = 0;
                } else if (char === "\n") {
                    this.listaError.push(
                        new Error(
                            "Error Léxico: Cadena no cerrada",
                            buffer,
                            linea,
                            columna
                        )
                    );
                    buffer = "";
                    linea += 1;
                    columna = 1;
                    estado = 0;
                } else if(char === "'"){
                    columna += 1;
                    buffer += "'";
                    this.listaTokens.push(new Token("CADENA", buffer, linea, columna));
                    buffer = "";
                    estado = 0;
                } else {
                    columna += 1;
                    buffer += char;
                }
            } else if (estado === 2) {
                if (this.identificadores(char) || this.esDigito(char)) {
                    columna += 1;
                    buffer += char;
                } else {
                    const tipo_token = this.palabrasReservadas(buffer);
                    if (tipo_token) {
                        this.listaTokens.push(
                            new Token(tipo_token, buffer, linea, columna)
                        );
                    } else {
                        this.listaTokens.push(
                            new Token("IDENTIFICADOR", buffer, linea, columna)
                        );
                    }
                    buffer = "";
                    estado = 0;
                    index -= 1;
                }
            } else if (estado === 3) {
                if (this.esDigito(char)) {
                    columna += 1;
                    buffer += char;
                } else {
                    this.listaTokens.push(new Token("ENTERO", buffer, linea, columna));
                    buffer = "";
                    estado = 0;
                    index -= 1;
                }
            }

            index += 1;
        }

        if (buffer && estado !== 0) {
            if (estado === 1) {
                this.listaError.push(
                    new LexError(
                        "Error Léxico: Cadena no cerrada",
                        buffer,
                        linea,
                        columna
                    )
                );
            } else if (estado === 2) {
                const tipo_token = this.palabrasReservadas(buffer);
                if (tipo_token)
                    this.listaTokens.push(new Token(tipo_token, buffer, linea, columna));
                else
                    this.listaTokens.push(
                        new Token("IDENTIFICADOR", buffer, linea, columna)
                    );
            } else if (estado === 3) {
                this.listaTokens.push(new Token("ENTERO", buffer, linea, columna));
            }
        }
    }
    imprimirTokens() {
        console.log("\n=== TOKENS ENCONTRADOS ===");
        this.listaTokens.forEach((token, i) => {
            console.log(
                `${i + 1}. Tipo: ${token.tipo}, Lexema: '${token.lexema}', Línea: ${token.linea
                }, Columna: ${token.columna}`
            );
        });
    }
    imprimirErrores() {
        if (this.listaError.length) {
            console.log("===ERRORES LEXICOS====");
            this.listaError.forEach((err, i) => {
                console.log(
                    `${i + 1}. ${err.tipo}: '${err.lexema}', Linea: ${err.linea
                    }, Columna: ${err.columna}`
                );
            });
        } else {
            console.log("\nNo se encontraron errores");
        }
    }
}


const scanner = new AnalizadorLexico();

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
        } else if (token.tipo === "DOUBLE"){
            this.declaracionBoolean();
        } else if (token.tipo === "IDENTIFICADOR") {
            this.asignacion();
        } else if (token.tipo === "IF") {
            this.ifStatement();
        } else if (token.tipo === "WHILE") {
            this.whileStatement();
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
    declaracionBoolean(){
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
        while (["+", "-", "*", "/","==", "!=", "<", ">", "<=", ">=", "++", "--"].includes(this.tokenActual()?.lexema)) {
            this.avanzar();
            this.termino();
        }
    }
    condicion(){
        const token = this.tokenActual();
        if(this.coincidir("IDENTIFICADOR")){
            //if(this.coincidir("OPC") || this.coincidir("OP")){
            if(["==", "!=", "<", ">", "<=", ">="].includes(this.tokenActual()?.lexema)){
                this.avanzar();
                if(this.coincidir("ENTERO") || this.coincidir("CADENA") || this.coincidir("BOOLEAN")){
                    this.avanzar();
                }
            }
        } else{
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
    whileStatement(){
        this.avanzar();
        this.coincidir("PARENTESIS_ABRE"); // (
        this.condicion();
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

/* traductor */

export class Traductor {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
        this.codigoPython = "";
        this.indentacion = 0;
    }
    inicio(){
        this.avanzar();
        const nombre = this.tokenActual()?.lexema;
        this.avanzar();
        if (this.tokenActual()?.lexema === "="){
            
        }
    }
    declaracion() {
        this.avanzar();
        const nombre = this.tokenActual()?.lexema;
        this.avanzar();

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
        this.avanzar();
        this.avanzar();
        const valor = this.expresion();
        this.avanzar();
        this.escribir(`${nombre} = ${valor}`);
    }
    expresion() {
        let resultado = "";
        while (this.tokenActual() && this.tokenActual().tipo !== "SIMBOLO") {
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
        } else if (token.lexema === "CLASS") {
            while (this.tokenActual()?.lexema !== "{") this.avanzar();
            this.avanzar();
            this.asignacion();
        } else if (token.tipo === "IF") {
            this.ifStatement();
        } else if (token.tipo === "WHILE") {
            this.whileStatement();
        } else if (token.tipo === "SIMBOLO" && token.lexema === "{") {
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