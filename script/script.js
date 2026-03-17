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
        fetch('data/data.xml') 
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar el XML");
                return response.text();
            })
            .then(strXML => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(strXML, "text/xml");
                const parserError = xmlDoc.querySelector("parsererror");
                if (parserError) throw new Error("Error al interpretar el XML");

                const relojes = xmlDoc.getElementsByTagName('reloj');
                for (let i = 0; i < relojes.length; i++) {
                    const titulo = relojes[i].getElementsByTagName('titulo')[0].textContent;
                    const texto = relojes[i].getElementsByTagName('texto')[0].textContent;
                    const imagen = relojes[i].getElementsByTagName('imagen')[0].textContent;
                    crearTarjetaHTML(titulo, texto, imagen);
                }
            })
            .catch(error => {
                console.error("Hubo un problema cargando el XML:", error);
                contenedorTarjetas.innerHTML = `<p style="text-align:center; color:red;">Error cargando la colección. Usa Live Server.</p>`;
            });
    }

    // --- CREAR TARJETA ---
    function crearTarjetaHTML(titulo, texto, rutaImagen) {
        const div = document.createElement('div');
        div.classList.add('tarjeta-reloj');
        div.innerHTML = `
            <img src="${rutaImagen}" alt="${titulo}">
            <h2>${titulo}</h2>
            <p>${texto}</p>
        `;
        contenedorTarjetas.appendChild(div);
    }

    // --- BUSCADOR DE TARJETAS ---
    function filtrarTarjetas() {
        const textoBusqueda = inputBusqueda.value.toLowerCase();
        const tarjetas = document.querySelectorAll('.tarjeta-reloj');

        tarjetas.forEach(tarjeta => {
            const titulo = tarjeta.querySelector('h2').textContent.toLowerCase();
            tarjeta.style.display = titulo.includes(textoBusqueda) ? 'flex' : 'none';
        });
    }

    btnBuscar.addEventListener('click', filtrarTarjetas);
    inputBusqueda.addEventListener('input', filtrarTarjetas);

    // --- SISTEMA DE TEMAS ---
    selectorTema.addEventListener('change', (e) => {
        const tema = e.target.value;
        const body = document.body;

        // Resetear variables y clases
        body.classList.remove('tema-claro');
        body.style.removeProperty('--bg-body');
        body.style.removeProperty('--bg-header');
        body.style.removeProperty('--bg-footer');
        body.style.removeProperty('--text-main');
        body.style.removeProperty('--text-secondary');
        body.style.removeProperty('--accent-color');

        if (tema === 'claro') {
            body.classList.add('tema-claro');
        } else if (tema === 'personalizado') {
            modalPersonalizar.classList.add('activo');
            selectorTema.value = 'oscuro';
        }
        // Si es 'oscuro', se mantiene por defecto :root
    });

    // --- MODAL PERSONALIZAR ---
    btnCancelarColor.addEventListener('click', () => {
        modalPersonalizar.classList.remove('activo');
    });

    formColores.addEventListener('submit', (e) => {
        e.preventDefault();
        const colorHeader = document.getElementById('colorHeader').value;
        const colorMain = document.getElementById('colorMain').value;
        const colorFooter = document.getElementById('colorFooter').value;

        // Aplicar colores personalizados incluyendo texto y acento
        const body = document.body;
        body.style.setProperty('--bg-header', colorHeader);
        body.style.setProperty('--bg-body', colorMain);
        body.style.setProperty('--bg-footer', colorFooter);

        // Ajustar textos y acentos a contraste básico
        body.style.setProperty('--text-main', '#f5f5f5');
        body.style.setProperty('--text-secondary', '#ddd');
        body.style.setProperty('--accent-color', '#d4af37');

        modalPersonalizar.classList.remove('activo');
    });

    // --- MODAL AÑADIR TARJETA ---
    btnAñadir.addEventListener('click', () => modalAñadir.classList.add('activo'));
    btnCancelarAñadir.addEventListener('click', () => {
        modalAñadir.classList.remove('activo');
        formNuevoReloj.reset();
    });

    formNuevoReloj.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevoTitulo = document.getElementById('nuevoTitulo').value;
        const nuevoTexto = document.getElementById('nuevoTexto').value;
        const inputImagen = document.getElementById('nuevaImagen');

        if (inputImagen.files && inputImagen.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                crearTarjetaHTML(nuevoTitulo, nuevoTexto, e.target.result);
                modalAñadir.classList.remove('activo');
                formNuevoReloj.reset();
                alert("Reloj añadido correctamente a la galería.");
            };
            reader.readAsDataURL(inputImagen.files[0]);
        } else {
            alert("Por favor, selecciona una imagen.");
        }
    });

    // --- CERRAR MODALES HACIENDO CLIC FUERA ---
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