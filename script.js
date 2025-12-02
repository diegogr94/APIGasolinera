// URLs de la API
const URL_PROVINCIAS = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/Provincias/";
const URL_MUNICIPIOS = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/Listados/MunicipiosPorProvincia/";
const URL_GASOLINERAS = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipio/";

// Al cargar la página
window.onload = function() {
    cargarProvincias();
    
    // Asignar eventos a los botones
    document.getElementById("select-provincia").addEventListener("change", cargarMunicipios);
    document.getElementById("btn-buscar").addEventListener("click", buscarGasolineras);
};


async function cargarProvincias() {
    const respuesta = await fetch(URL_PROVINCIAS);
    const datos = await respuesta.json();
    
    const select = document.getElementById("select-provincia");

    datos.forEach(item => {
        const opcion = document.createElement("option");
        opcion.value = item.IDPovincia; 
        opcion.textContent = item.Provincia;
        select.appendChild(opcion);
    });
}


async function cargarMunicipios() {
    const idProvincia = document.getElementById("select-provincia").value;
    const selectMuni = document.getElementById("select-municipio");
    
    // Limpiamos el select
    selectMuni.innerHTML = "<option value=''>Cargando...</option>";
    selectMuni.disabled = false; // Activamos el select

    if (idProvincia) {
        const respuesta = await fetch(URL_MUNICIPIOS + idProvincia);
        const datos = await respuesta.json();

        selectMuni.innerHTML = "<option value=''>Selecciona Municipio</option>";
        
        datos.forEach(item => {
            const opcion = document.createElement("option");
            opcion.value = item.IDMunicipio;
            opcion.textContent = item.Municipio;
            selectMuni.appendChild(opcion);
        });
    }
}

//  Buscar y Mostrar gasolineras
async function buscarGasolineras() {
    const idMunicipio = document.getElementById("select-municipio").value;
    const tipoCombustible = document.getElementById("select-combustible").value;
    const soloAbiertas = document.getElementById("check-abiertas").checked;
    const contenedor = document.getElementById("contenedor-tarjetas");

    // Si no hay municipio, no hacemos nada
    if (!idMunicipio) {
        alert("Por favor, selecciona un municipio");
        return;
    }

    // Pedimos los datos
    const respuesta = await fetch(URL_GASOLINERAS + idMunicipio);
    const datos = await respuesta.json();
    const lista = datos.ListaEESSPrecio;

    // Limpiamos resultados anteriores
    contenedor.innerHTML = "";

    // Variable para saber si encontramos alguna
    let encontradas = false;

    // Recorremos todas las gasolineras una a una
    lista.forEach(gasolinera => {
        
        // Primer filtro: Si ha elegido un combustible y la gasolinera no tiene precio para ese, saltamos
        if (tipoCombustible !== "todos") {
            let precio = gasolinera[tipoCombustible];
            if (!precio || precio === "") {
                return; // este return actua como un continue
            }
        }

        // Segundo filtro: Si pide abiertas, mostramos las de "24H"
        if (soloAbiertas) {
            if (!gasolinera.Horario.includes("24H")) {
                return; 
            }
        }

        encontradas = true; //para mostrar el resultado
        
        // Decidimos qué precio mostrar
        let precioMostrar = "Ver ficha";
        if (tipoCombustible !== "todos") {
            precioMostrar = gasolinera[tipoCombustible] + " €";
        }

        // Creamos el html
        const tarjetaHTML = `
            <div class="tarjeta">
                <h3>${gasolinera.Rótulo}</h3>
                <p><strong>Dirección:</strong> ${gasolinera.Dirección}</p>
                <p><strong>Localidad:</strong> ${gasolinera.Localidad}</p>
                <p><strong>Horario:</strong> ${gasolinera.Horario}</p>
                <div class="precio-destacado">${precioMostrar}</div>
            </div>
        `;

        // Añadimos la tarjeta al contenedor
        contenedor.innerHTML += tarjetaHTML;
    });

    if (!encontradas) {
        contenedor.innerHTML = "<p>No se han encontrado gasolineras con esos filtros.</p>";
    }
}