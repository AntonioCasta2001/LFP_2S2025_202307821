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
        } else if (char === ".") {
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
        } 

        else if (this.esEspacio(char)) {
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
        } else if (char === "'") {
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

let entrada = `
public class  Calculadora {
    public  static void main(String[] args) {
        // Declaraciones de variables de tercer orden
        int numero = 42;
        double pi = 3.14;
        char letra = 'A';

    }
}`
const scanner = new AnalizadorLexico();
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
      this.errors.push(`Se esperaba '${tipoEsperado}' en línea ${token?.linea}, columna ${token?.columna}`);
      return false;
    }
  }

  parse() {
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
    } else if (["INT", "DOUBLE", "BOOLEAN", "CHAR"].includes(token.tipo)) {
      this.declaracion();
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
    } else if (token.tipo === "LLAVE_ABRE") {
      this.bloque();
    } else if (token.tipo === "CENTINELA") {
      this.avanzar();
    } else {
      this.errors.push(`Instrucción inválida en línea ${token.linea}, columna ${token.columna}`);
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
    this.coincidir("P&C");
  }

  asignacion() {
    this.avanzar(); // IDENTIFICADOR
    if (!this.coincidir("OP")) return;
    this.expresion();
    this.coincidir("P&C");
  }

  expresion() {
    this.termino();
    while (["+", "-", "*", "/", "==", "!=", "<", ">", "<=", ">=", "++", "--"].includes(this.tokenActual()?.lexema)) {
      this.avanzar();
      this.termino();
    }
  }

  termino() {
    const token = this.tokenActual();
    if (["ENTERO", "DOUBLE", "BOOLEAN", "CHAR", "CADENA", "IDENTIFICADOR"].includes(token?.tipo)) {
      this.avanzar();
    } else {
      this.errors.push(`Expresión inválida en línea ${token?.linea}, columna ${token?.columna}`);
      this.avanzar();
    }
  }

  condicion() {
    this.expresion(); // permite expresiones más flexibles
  }

  bloque() {
    this.coincidir("LLAVE_ABRE");
    while (this.tokenActual() && this.tokenActual().tipo !== "LLAVE_CIERRA") {
      this.instruccion();
    }
    this.coincidir("LLAVE_CIERRA");
  }

  ifStatement() {
    this.avanzar(); // IF
    this.coincidir("PARENTESIS_ABRE");
    this.condicion();
    this.coincidir("PARENTESIS_CIERRA");
    this.bloque();
  }

  whileStatement() {
    this.avanzar(); // WHILE
    this.coincidir("PARENTESIS_ABRE");
    this.condicion();
    this.coincidir("PARENTESIS_CIERRA");
    this.bloque();
  }

  forStatement() {
    this.avanzar(); // FOR
    this.coincidir("PARENTESIS_ABRE");

    // Parte 1: inicialización
    if (["INT", "DOUBLE", "BOOLEAN", "CHAR"].includes(this.tokenActual()?.tipo)) {
      this.declaracion();
    } else if (this.tokenActual()?.tipo === "IDENTIFICADOR") {
      this.asignacion();
    }

    // Parte 2: condición
    this.condicion();
    this.coincidir("P&C");

    // Parte 3: incremento
    if (this.tokenActual()?.tipo === "IDENTIFICADOR") {
      this.asignacion();
    }

    this.coincidir("PARENTESIS_CIERRA");
    this.bloque();
  }

  funcion() {
    this.coincidir("PUBLIC");
    this.coincidir("CLASS");
    this.coincidir("IDENTIFICADOR");
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
    this.bloque(); // cuerpo de main
    this.coincidir("LLAVE_CIERRA"); // cierre de main
    this.coincidir("LLAVE_CIERRA"); // cierre de clase
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