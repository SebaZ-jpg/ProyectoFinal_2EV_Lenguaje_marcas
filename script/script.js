/* ======================================================
   PROYECTO FINAL: MI GALERÍA (RELOJES PREMIUM)
   Script principal para cargar XML, buscar, temas y añadir
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- REFERENCIAS AL DOM ---
    const contenedorTarjetas = document.getElementById('contenedorTarjetas');
    const inputBusqueda = document.getElementById('inputBusqueda');
    const btnBuscar = document.getElementById('btnBuscar');
    const selectorTema = document.getElementById('selectorTema');
    const btnAñadir = document.getElementById('btnAñadir');
    
    // Modales
    const modalAñadir = document.getElementById('modalAñadir');
    const modalPersonalizar = document.getElementById('modalPersonalizar');
    const btnCancelarAñadir = document.getElementById('btnCancelarAñadir');
    const btnCancelarColor = document.getElementById('btnCancelarColor');
    const formNuevoReloj = document.getElementById('formNuevoReloj');
    const formColores = document.getElementById('formColores');

    // --- 1. CARGA DE DATOS DESDE XML ---
    function cargarDatosXML() {
        // Ruta relativa al archivo XML dentro de la carpeta data
        fetch('data/data.xml') 
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar el XML");
                return response.text();
            })
            .then(strXML => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(strXML, "text/xml");
                
                // Verificar errores de parseo
                const parserError = xmlDoc.querySelector("parsererror");
                if (parserError) throw new Error("Error al interpretar el XML");

                const relojes = xmlDoc.getElementsByTagName('reloj');
                
                // Recorrer cada nodo <reloj> y crear la tarjeta
                for (let i = 0; i < relojes.length; i++) {
                    const titulo = relojes[i].getElementsByTagName('titulo')[0].textContent;
                    const texto = relojes[i].getElementsByTagName('texto')[0].textContent;
                    const imagen = relojes[i].getElementsByTagName('imagen')[0].textContent;
                    
                    crearTarjetaHTML(titulo, texto, imagen);
                }
            })
            .catch(error => {
                console.error("Hubo un problema cargando el XML:", error);
                contenedorTarjetas.innerHTML = `<p style="text-align:center; color:red;">Error cargando la colección. Asegúrate de usar Live Server.</p>`;
            });
    }

    // Función auxiliar para generar el HTML de una tarjeta
    function crearTarjetaHTML(titulo, texto, rutaImagen) {
        const div = document.createElement('div');
        div.classList.add('tarjeta-reloj'); // Clase que coincide con tu CSS
        
        div.innerHTML = `
            <img src="${rutaImagen}" alt="${titulo}">
            <h3>${titulo}</h3>
            <p>${texto}</p>
        `;
        
        contenedorTarjetas.appendChild(div);
    }

    // --- 2. BUSCADOR DE TARJETAS ---
    function filtrarTarjetas() {
        const textoBusqueda = inputBusqueda.value.toLowerCase();
        const tarjetas = document.querySelectorAll('.tarjeta-reloj');

        tarjetas.forEach(tarjeta => {
            const titulo = tarjeta.querySelector('h3').textContent.toLowerCase();
            
            if (titulo.includes(textoBusqueda)) {
                tarjeta.style.display = 'flex'; // Mostrar (flex por tu CSS)
            } else {
                tarjeta.style.display = 'none'; // Ocultar
            }
        });
    }

    // Event Listeners para el buscador
    btnBuscar.addEventListener('click', filtrarTarjetas);
    inputBusqueda.addEventListener('input', filtrarTarjetas); // Búsqueda en tiempo real

    // --- 3. SISTEMA DE TEMAS ---
    selectorTema.addEventListener('change', (e) => {
        const tema = e.target.value;
        const body = document.body;

        // Resetear clases
        body.classList.remove('tema-claro');
        body.style.setProperty('--bg-body', ''); 
        body.style.setProperty('--bg-header', '');
        body.style.setProperty('--bg-footer', '');

        if (tema === 'claro') {
            body.classList.add('tema-claro');
        } else if (tema === 'personalizado') {
            modalPersonalizar.classList.add('activo');
            // Volver al select anterior si cancela (lógica simple)
            selectorTema.value = 'oscuro'; 
        }
        // Si es 'oscuro', no hacemos nada porque es el default en :root
    });

    // Lógica Modal Personalizar
    document.getElementById('btnCancelarColor').addEventListener('click', () => {
        modalPersonalizar.classList.remove('activo');
    });

    formColores.addEventListener('submit', (e) => {
        e.preventDefault();
        const colorHeader = document.getElementById('colorHeader').value;
        const colorMain = document.getElementById('colorMain').value;
        const colorFooter = document.getElementById('colorFooter').value;

        // Aplicar variables CSS inline directamente al body
        document.body.style.setProperty('--bg-header', colorHeader);
        document.body.style.setProperty('--bg-body', colorMain);
        document.body.style.setProperty('--bg-footer', colorFooter);
        
        modalPersonalizar.classList.remove('activo');
        selectorTema.value = 'oscuro'; // Reset visual del select
    });

    // --- 4. AÑADIR NUEVA TARJETA (Con FileReader) ---
    
    // Abrir modal
    btnAñadir.addEventListener('click', () => {
        modalAñadir.classList.add('activo');
    });

    // Cerrar modal
    btnCancelarAñadir.addEventListener('click', () => {
        modalAñadir.classList.remove('activo');
        formNuevoReloj.reset();
    });

    // Guardar nueva tarjeta
    formNuevoReloj.addEventListener('submit', (e) => {
        e.preventDefault();

        const nuevoTitulo = document.getElementById('nuevoTitulo').value;
        const nuevoTexto = document.getElementById('nuevoTexto').value;
        const inputImagen = document.getElementById('nuevaImagen');

        if (inputImagen.files && inputImagen.files[0]) {
            const reader = new FileReader();

            reader.onload = function(e) {
                // e.target.result contiene la imagen en Base64
                const rutaImagenBase64 = e.target.result;
                
                // Crear la tarjeta dinámicamente en el DOM
                crearTarjetaHTML(nuevoTitulo, nuevoTexto, rutaImagenBase64);
                
                // Cerrar modal y limpiar
                modalAñadir.classList.remove('activo');
                formNuevoReloj.reset();
                alert("Reloj añadido correctamente a la galería.");
            };

            // Leer el archivo como URL de datos (Base64)
            reader.readAsDataURL(inputImagen.files[0]);
        } else {
            alert("Por favor, selecciona una imagen.");
        }
    });

    // Cerrar modales si se hace clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === modalAñadir) {
            modalAñadir.classList.remove('activo');
            formNuevoReloj.reset();
        }
        if (e.target === modalPersonalizar) {
            modalPersonalizar.classList.remove('activo');
        }
    });

    // --- INICIALIZACIÓN ---
    cargarDatosXML();
});