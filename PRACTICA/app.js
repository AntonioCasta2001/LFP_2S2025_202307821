const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


class generarReportes{
    historial(registros) {
    let html = `<h1>Historial de Llamadas</h1><table border="1"><tr><th>Operador</th><th>Cliente</th><th>Estrellas</th></tr>`;
    registros.forEach(r => {
      html += `<tr><td>${r.nombre_operador}</td><td>${r.nombre_cliente}</td><td>${r.estrellas}</td></tr>`;
    });
    html += `</table>`;
    fs.writeFileSync('historial.html', html);
  }
}
class exportarOperadores{
    exportar(registros){
        const operadores = [...new Map(registros.map(r => [r.id_operador, r.nombre_operador])).entries()];
        let html = `<h1>Listado de Operadores</h1><table border="1"><tr><th>ID</th><th>Nombre</th></tr>`;
        operadores.forEach(([id, nombre]) => {
            html += `<tr><td>${id}</td><td>${nombre}</td></tr>`;
        });
        html += `</table>`;
        fs.writeFileSync('operadores.html', html);
    }
}
class exportarClientes{
    clientes(rutaArchivo){
      const clientes = [...new Map(rutaArchivo.map(r => [r.id_cliente, r.nombre_cliente])).entries()];
      let html = `<h1>Listado de Clientes</h1><table border="1"><tr><th>ID</th><th>Nombre</th></tr>`;
      clientes.forEach(([id, nombre]) => {
      html += `<tr><td>${id}</td><td>${nombre}</td></tr>`;
      });
      html += `</table>`;
      fs.writeFileSync('clientes.html', html);
    }
}
class exportarRendimiento{
  rendimiento(rutaArchivo){
    const total = rutaArchivo.length;
      const operadores = {};
      rutaArchivo.forEach(r => {
        operadores[r.id_operador] = operadores[r.id_operador] || { nombre: r.nombre_operador, count: 0 };
        operadores[r.id_operador].count++;
      });
      let html = `<h1>Rendimiento de Operadores</h1><table border="1"><tr><th>ID</th><th>Nombre</th><th>% Atención</th></tr>`;
      for (const [id, data] of Object.entries(operadores)) {
        const porcentaje = ((data.count / total) * 100).toFixed(2);
        html += `<tr><td>${id}</td><td>${data.nombre}</td><td>${porcentaje}%</td></tr>`;
      }
      html += `</table>`;
      fs.writeFileSync('rendimiento.html', html)
  }
}
class clasificacion{
  mostrar(registros){
    const total = registros.length;
    const counts = { Buena: 0, Media: 0, Mala: 0 };
    registros.forEach(r => counts[r.clasificacion]++);
    console.log('\n Porcentaje de Clasificación:');
    for (const [tipo, count] of Object.entries(counts)) {
      console.log(`${tipo}: ${(count / total * 100).toFixed(2)}%`);
    }
  }
}
class cantidadEstrellas{
  mostrar(registros){
    const counts = [0, 0, 0, 0, 0];
    registros.forEach(r => counts[r.estrellas - 1]++);
    console.log('\n Cantidad por Calificación:');
    counts.forEach((c, i) => {
    console.log(`${i + 1} estrella(s): ${c}`);
  });
  }
}
class menu{
    constructor(){
        this.datos=[];
        this.configuracion = {
          directorioSalida: "./reportes"
        }
    }
    async start(){
        console.log("Se inicio el programa");
        await this.menu();
    }
  async menu(){
  console.log('\n--------------- Menú Principal-------------------');
  console.log('1. Cargar Registros de Llamadas');
  console.log('2. Exportar Historial de Llamadas');
  console.log('3. Exportar Listado de Operadores');
  console.log('4. Exportar Listado de Clientes');
  console.log('5. Exportar Rendimiento de Operadores');
  console.log('6. Mostrar Porcentaje de Clasificación de Llamadas');
  console.log('7. Mostrar Cantidad de Llamadas por Calificación');
  console.log('8. Salir');
  const opcion = await this.preguntarInfo("Elige una opcion: ");
  await this.manejarOpcion(opcion);
  }
  async manejarOpcion(opcion){
    switch (opcion) {
      case '1':
        const opcion = await this.preguntarInfo2("Escriba el directorio del archivo: ");
        const extension = path.extname(opcion).toLowerCase();
        if(extension===".csv"){
          this.datos = cargarArchivos(opcion)
          console.log('Registros cargados correctamente.');
        } else{
          console.log("No es un archivo .csv");
        }
        this.menu();
        break;
      case '2':
        const exporta= new generarReportes();
        if(this.datos.length===0){
          console.log("no hay datos")
        } else{
          exporta.historial(this.datos);
          console.log(' Historial exportado como historial.html');
        }
        this.menu();
        break;
      case '3':
        const operadores = new exportarOperadores();
        if(this.datos.length===0){
          console.log("no hay datos");
        } else{
          operadores.exportar(this.datos);
          console.log(' Operadores exportados como html');
        }
        this.menu();
        break;
      case '4':
        const clientes = new exportarClientes();
        if(this.datos.length===0){
          console.log("no hay datos");
        }else{
          clientes.clientes(this.datos)
          console.log(' Clientes exportados como html');
        }
        this.menu();
        break;
      case '5':
        const exportacion = new exportarRendimiento();
        if(this.datos.length===0){
          console.log("no hay datos");
        }else{
          exportacion.rendimiento(this.datos);
          console.log(' Rendimiento exportado como html');
        }
        this.menu();
        break;
      case '6':
        const porcentaje = new clasificacion();
        if(this.datos.length===0){
          console.log("no hay datos");
        }else{
          porcentaje.mostrar(this.datos);
        }
        this.menu();
        break;
      case '7':
        const cantidad = new cantidadEstrellas();
        if(this.datos.length===0){
          console.log("no hay datos");
        }else{
          cantidad.mostrar(this.datos);
        }
        this.menu();
        break;
      case '8':
        console.log('Saliendo...');
        process.exit(1);
      default:
        console.log(' !Error: elige una de las 8 opciones');
        this.menu();
    }
  }
  preguntarInfo(pregunta) {
    return new Promise((resultado) => {
      rl.question(pregunta, resultado);
    });
    }
  preguntarInfo2(pregunta){
        return new Promise((resultado) =>{
            rl.question(pregunta, resultado);
        });
  }
}
 
const app = new menu();
app.start().catch(console.error);


function cargarArchivos(rutaArchivo){
    const datos = fs.readFileSync(rutaArchivo,'utf-8');
    const linea = datos.trim().split('\n');

    return linea.slice(1).map(lineas =>{
      const valores = lineas.split(",");
      const registro = {
        id_operador: valores[0],
        nombre_operador: valores[1],
        id_cliente: valores[3],
        nombre_cliente: valores[4]
      }
      const estrellitas = lineas.split(/[;,]/).filter(estrellitas => estrellitas === 'x');
      let estrellas = estrellitas.length;
      let clasificacion = " ";
      if (estrellas>=4){
        clasificacion = 'Buena';
      } else if (estrellas>=2){
        clasificacion = 'Media';
      } else{
        clasificacion = 'Mala';
      }
      return {
      id_operador: registro.id_operador,
      nombre_operador: registro.nombre_operador,
      estrellas,
      clasificacion,
      id_cliente: registro.id_cliente,
      nombre_cliente: registro.nombre_cliente
    };
    })
}