const btnGuardar = document.getElementById('btnGuardar');
const formulario = document.getElementById('formulario');
const btnVerDetalles = document.getElementById('btnVerDetalles');
const divDetalleVentas = document.getElementById('detalleVentas');
const contendorDetalles = document.getElementById('contenedorTabla');
const importeTotalVentasHoy = document.getElementById('importeTotalVentasHoy');
const btnRecargarTabla = document.getElementById('btnRecargarTabla');
const tablaVentasAnteriores = document.getElementById('detalleVentasAnteriores');
const divFiltrar = document.getElementById('divFiltrar');


const db = firebase.firestore();
const fecha = new Date;

const docRef = db.collection("carniceria").doc("productos");
const docRefVentas = db.collection("carniceria").doc("ventasNuevo");


const MESES = [
    { id: 1, mes: 'enero' }, { id: 2, mes: 'febrero' }, { id: 3, mes: 'marzo' },
    { id: 4, mes: 'abril' }, { id: 5, mes: 'mayo' }, { id: 6, mes: 'junio' },
    { id: 7, mes: 'julio' }, { id: 8, mes: 'agosto' }, { id: 9, mes: 'septiembre' },
    { id: 10, mes: 'octubre' }, { id: 11, mes: 'noviembre' }, { id: 12, mes: 'diciembre' }
];

const DIA_ACTUAL = fecha.getDate().toString();
const MES_ACTUAL = MESES[fecha.getMonth()].mes;

docRef.get().then((doc) => {
    if (doc.exists) {

        const productos = doc.data().productos;
        let opcionesProducto = '<option selected value="varios articulos">--Varios--</option>';
        productos.forEach(producto => {

            opcionesProducto += `<option value="${producto}">${producto}</option>`;
        });

        selectCorte.innerHTML = opcionesProducto;

    } else {
        console.log("No such document!");
    }
}).catch((error) => {
    console.log("Error getting document:", error);
});



docRefVentas.collection(MES_ACTUAL).doc(DIA_ACTUAL).get().then((doc) => {
    if (doc.exists) {
        
        ventasHoy = doc.data();
        let importe = 0;

        ventasHoy.ventas.forEach(venta => {
            importe += venta.importe;
        });

        importeTotalVentasHoy.innerHTML = importe.toFixed(2);

    } else {
        importeTotalVentasHoy.innerHTML = 0.00;
    }
}).catch((error) => {
    console.log("Error getting document:", error);
});


const crearDivFiltrar = () => {

    let opcionesMeses = '';
    let opcionesDias = '';
    MESES.forEach(mes => {
        opcionesMeses += `<option value="${mes.id}">${mes.mes}</option>`;
    });

    for (let i = 1; i <= 31; i++) {
        opcionesDias += `<option value="${i}">${i}</option>`
    }

    divFiltrar.innerHTML = `
    <div class="divItemForm">
    <label>Mes</label>
    <select name="selectMes">${opcionesMeses}</select>
    </div>

    <div class="divItemForm">
    <label>Dia</label>
    <select name="selectDia">${opcionesDias}</select>
    </div>

    <div class="divItemForm">
    <label class="textoOculto">..</label>
      <button class="btnFiltrar" onClick="filtrarVentasAnteriores()">Filtrar</button>
    </div>
    
    `;
}

crearDivFiltrar();


const filtrarVentasAnteriores = () => {

    const selectMes = divFiltrar.children[0].children[1].value;
    const selectDia = divFiltrar.children[1].children[1].value;
    //const diaActual = fecha.getDate();

    try {
        let htmlTabla = '';
        const docRef = db.collection('carniceria').doc('ventasNuevo').
            collection(MESES[selectMes - 1].mes);
        docRef.where('fecha', '>=', parseInt(selectDia))/*.where('fecha', '<=', diaActual)*/.get()
            .then(querySnapshot => {

                querySnapshot.forEach((doc) => {

                    const data = doc.data();

                    let importeTotal = 0;
                    data.ventas.forEach(venta => {
                        importeTotal += venta.importe;
                    });

                    htmlTabla += `<tr><td>${data.fecha}/${selectMes}</td><td>$ ${importeTotal.toFixed(2)}</td></tr>`;
                });

                if (htmlTabla === '') {
                    htmlTabla = '<div class="alertError">No hay registros para estas fechas..</div>'
                }
                tablaVentasAnteriores.innerHTML = htmlTabla;

            });



    } catch (error) {
        console.log(error.message);
    }

}
/*
const guardarVenta = () => {

    const producto = formulario.select.value;
    const precio = formulario.input.value;

    if (producto.trim() === '' || precio.trim() === '') {
        return alert('Completa todos los campos');
    }
    if (parseFloat(precio) > 100000 || precio === NaN) {
        return alert('Ingresa un precio valido.');
    }

    
    const actual = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`;

    const docVenta = {
        producto,
        importe: parseFloat(precio)
    }

    try {
        const ventasRef = db.collection("carniceria").doc("ventas");
        ventasRef.update({
            [actual]: firebase.firestore.FieldValue.arrayUnion(docVenta)
        });

        const importeAcumulado = parseFloat(importeTotalVentasHoy.innerHTML);

        importeTotalVentasHoy.innerHTML = (importeAcumulado + parseFloat(precio)).toFixed(2);
        alert('Guardado correctamente');
        formulario.reset();
    } catch (error) {
        alert(`Ocurrio un error: ${error.message}`)
    }




}
*/

btnVerDetalles.addEventListener('click', () => {

    contendorDetalles.style.display = 'block';
    mostrarTodasLasVentasDelDia();
});

btnRecargarTabla.addEventListener('click', () => {
    mostrarTodasLasVentasDelDia();
});


const mostrarTodasLasVentasDelDia = () => {

    const diaActual = fecha.getDate().toString();
    const mesActual = MESES[fecha.getMonth()].mes;

    const docRef = db.collection("carniceria").doc("ventasNuevo").collection(mesActual).doc(diaActual);

    try {

        docRef.get()
            .then(doc => {
                if (doc.exists) {

                    const ventasDelDia = doc.data();

                    let detalles = "";
                    let importe = 0;

                    ventasDelDia.ventas.forEach(venta => {
                        importe += venta.importe;
                        detalles += `<tr><td>${venta.producto}</td><td>$ ${venta.importe}</td></tr>`;
                    });

                    divDetalleVentas.innerHTML = detalles;
                    importeTotalVentasHoy.innerHTML = importe.toFixed(2);
                }
            });
    } catch (error) {
        console.log(error.message);
    }

}


const guardarNuevaVenta = async () => {

    const producto = formulario.select.value;
    const precio = formulario.input.value;

    if (producto.trim() === '' || precio.trim() === '') {
        return alert('Completa todos los campos');
    }
    if (parseFloat(precio) > 100000 || precio === NaN) {
        return alert('Ingresa un precio valido.');
    }

    const fechaActual = { dia: fecha.getDate().toString(), mes: MESES[fecha.getMonth()] };

    const docVenta = {
        producto,
        importe: parseFloat(precio)
    }

    try {

        const ventasRef = db.collection("carniceria").doc("ventasNuevo").
            collection(fechaActual.mes.mes).doc(fechaActual.dia);

        ventasRef.update({
            ventas: firebase.firestore.FieldValue.arrayUnion(docVenta)
        });

        const importeAcumulado = parseFloat(importeTotalVentasHoy.innerHTML);

        importeTotalVentasHoy.innerHTML = (importeAcumulado + parseFloat(precio)).toFixed(2);
        alert('Guardado correctamente');
        formulario.reset();

    } catch (error) {
        alert(`Ocurrio un error: ${error.message}`)
    }

}

btnGuardar.addEventListener('click', e => {
    e.preventDefault();
    guardarNuevaVenta();

});



//CREAR COLECCION Y DOCUMENTOS POR MES
const crearDocumentos = (dia) => {

    const fechaAct = {
        numero: `${dia}`,
        mes: 'abril'
    }
    const docRef = db.collection('carniceria').doc('ventasNuevo').collection(fechaAct.mes).doc(fechaAct.numero);

    const data = {
        descripcion: `Ventas del dia ${fechaAct.numero}/${fechaAct.mes}/2022`,
        ventas: []
    }

    docRef.set(data);

}
