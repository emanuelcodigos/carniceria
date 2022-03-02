const btnGuardar = document.getElementById('btnGuardar');
const formulario = document.getElementById('formulario');
const btnVerDetalles = document.getElementById('btnVerDetalles');
const divDetalleVentas = document.getElementById('detalleVentas');
const contendorDetalles = document.getElementById('contenedorTabla');
const importeTotalVentasHoy = document.getElementById('importeTotalVentasHoy');
const btnRecargarTabla = document.getElementById('btnRecargarTabla');
const tablaVentasAnteriores = document.getElementById('detalleVentasAnteriores');

const db = firebase.firestore();
const fecha = new Date;

const docRef = db.collection("carniceria").doc("productos");
const docRefVentas = db.collection("carniceria").doc("ventas");
const docRefVentasAnteriores = db.collection("carniceria").doc("ventas"); 

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

docRefVentas.get().then((doc) => {
    if (doc.exists) {
        const actual = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
        ventasHoy = doc.data()[actual];
        let importe = 0;

        ventasHoy.forEach( venta => {
            importe += venta.importe;
        });

        importeTotalVentasHoy.innerHTML = importe.toFixed(2);



    } else {
        console.log("No such document!");
    }
}).catch((error) => {
    console.log("Error getting document:", error);
});


docRefVentasAnteriores.get().then((doc) => {
    if (doc.exists) {
        
        const ventas = doc.data();

        //console.log(ventas);

        const arrayVentas = Object.entries(ventas);
        let htmlTabla = '';
        arrayVentas.forEach( ventasDia => {
            
            let importeVentas = 0;
            ventasDia[1].forEach( venta => {
                importeVentas += venta.importe;
            });

            htmlTabla += `<tr><td>${ventasDia[0]}</td><td>$ ${importeVentas.toFixed(2)}</td></tr>`;
            
        });

        tablaVentasAnteriores.innerHTML = htmlTabla;
        

        //importeTotalVentasHoy.innerHTML = importe.toFixed(2);
    } else {
        console.log("No such document!");
    }
}).catch((error) => {
    console.log("Error getting document:", error);
});


btnGuardar.addEventListener('click', e => {
    e.preventDefault();
    guardarVenta();

});

const guardarVenta = () => {

    const producto = formulario.select.value;
    const precio = parseFloat(formulario.input.value);

    if (producto.trim() === '' || precio === NaN || precio === null || precio === undefined) {
        return alert('Completa todos los campos');
    }
    if(typeof(precio) === 'string'){
        return alert('Ingresa un precio valido.'); 
    }
    if(precio.toString().trim() === '' || precio > 100000){
        return alert('Ingresa un precio valido.');
    }

    const actual = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
    
    const docVenta = {
        producto,
        importe: precio
    }

    try {
        const ventasRef = db.collection("carniceria").doc("ventas");
        ventasRef.update({
            [actual]: firebase.firestore.FieldValue.arrayUnion(docVenta)
        });

        const importeAcumulado = parseFloat(importeTotalVentasHoy.innerHTML);
        
        importeTotalVentasHoy.innerHTML = (importeAcumulado + precio).toFixed(2);
        alert('Guardado correctamente');
        formulario.reset();
    } catch (error) {
        alert(`Ocurrio un error: ${error.message}`)
    }




}


btnVerDetalles.addEventListener('click', () => {

    contendorDetalles.style.display = 'block';
    mostrarTodasLasVentasDelDia();
});

btnRecargarTabla.addEventListener('click', () => {
    mostrarTodasLasVentasDelDia();
});

const mostrarTodasLasVentasDelDia = () => {
    const actual = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
    //console.log(actual);

    const docRef = db.collection("carniceria").doc("ventas");

    docRef.get().then((doc) => {
        if (doc.exists) {

            const ventasDelDia = doc.data()[actual];
            let detalles = "";
            let importe = 0;
            ventasDelDia.forEach(venta => {
                importe += venta.importe;
                detalles += `<tr><td>${venta.producto}</td><td>$ ${venta.importe}</td></tr>`;
            });

            divDetalleVentas.innerHTML = detalles;
            importeTotalVentasHoy.innerHTML = importe.toFixed(2);

        } else {
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}
