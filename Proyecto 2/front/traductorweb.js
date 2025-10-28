// traductorWeb.js
import { AnalizadorLexico } from '../Analisis.js';
import { Parser } from '../parser.js';
import { Traductor } from '../translate.js';

export function traducirCodigoJava() {
  const entrada = document.getElementById('editor').value;

  const escaner = new AnalizadorLexico();
  escaner.analizar(entrada);

  if (escaner.listaError.length > 0) {
    alert("Errores léxicos:\n" + escaner.listaError.map(e =>
      `${e.tipo} → '${e.lexema}' en línea ${e.linea}, columna ${e.columna}`
    ).join("\n"));
    return;
  }

  const parser = new Parser(escaner.listaTokens);
  const erroresSintacticos = parser.parse();

  if (erroresSintacticos.length > 0) {
    alert("Errores sintácticos:\n" + erroresSintacticos.join("\n"));
    return;
  }

  const traductor = new Traductor(escaner.listaTokens);
  const codigoPython = traductor.traducir();

  document.getElementById('output').value = codigoPython;
}