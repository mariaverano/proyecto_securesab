// ========================================
// Lógica de filtros y exportación - Asistencia Ambiente
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos
    const tabla = document.getElementById('asistenciaAmbienteTabla');
    const filtroFicha = document.getElementById('asistenciaAmbienteFicha');
    const filtroDocumento = document.getElementById('asistenciaAmbienteDocumento');
    const filtroFecha = document.getElementById('fechaFiltroAmbiente');
    const filtroEstado = document.getElementById('asistenciaAmbienteEstado');
    const btnAplicar = document.getElementById('applyAmbienteFiltersBtn');
    const btnExportar = document.getElementById('exportAmbienteBtn');
    const btnLimpiar = document.getElementById('clearAmbienteFiltersBtn');

    // Guardar todas las filas originales (solo una vez)
    let filasOriginales = [];
    if (tabla) {
        filasOriginales = Array.from(tabla.querySelectorAll('tr')).filter(fila => {
            return fila.querySelectorAll('td').length > 0 && !fila.classList.contains('no-results-row');
        });
    }

    // ========================================
    // Función para aplicar filtros
    // ========================================
    function aplicarFiltros() {
        // Remover mensaje de sin resultados antes de filtrar
        const mensajeAnterior = tabla.querySelector('.no-results-row');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        // Obtener valores de filtros
        const fichaSeleccionada = filtroFicha ? filtroFicha.value : 'all';
        const busquedaTexto = filtroDocumento ? filtroDocumento.value.toLowerCase().trim() : '';
        const fechaSeleccionada = filtroFecha ? filtroFecha.value : '';
        const estadoSeleccionado = filtroEstado ? filtroEstado.value : 'all';

        // Primero mostrar todas las filas
        filasOriginales.forEach(fila => {
            fila.style.display = '';
        });

        // Luego aplicar cada filtro
        filasOriginales.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length === 0) return;

            let mostrar = true;

            // Obtener datos de la fila
            const documento = celdas[0].textContent.trim();
            const nombre = celdas[1].textContent.trim().toLowerCase();
            const fichaBadge = celdas[2].querySelector('.ficha-badge');
            const ficha = fichaBadge ? fichaBadge.textContent.trim() : '';
            const fechaCell = celdas[3].textContent.replace(/[^\d-]/g, '').trim();
            
            // Obtener estado
            const estadoBadge = celdas[4].querySelector('.estado-badge');
            let estado = '';
            if (estadoBadge) {
                if (estadoBadge.classList.contains('asistio')) {
                    estado = 'Asistio';
                } else if (estadoBadge.classList.contains('inasistio')) {
                    estado = 'Inasistio';
                }
            }

            // FILTRO 1: Por ficha
            if (fichaSeleccionada && fichaSeleccionada !== 'all') {
                if (ficha !== fichaSeleccionada) {
                    mostrar = false;
                }
            }

            // FILTRO 2: Por documento o nombre
            if (mostrar && busquedaTexto) {
                if (!documento.toLowerCase().includes(busquedaTexto) && 
                    !nombre.includes(busquedaTexto)) {
                    mostrar = false;
                }
            }

            // FILTRO 3: Por fecha
            if (mostrar && fechaSeleccionada) {
                if (fechaCell !== fechaSeleccionada) {
                    mostrar = false;
                }
            }

            // FILTRO 4: Por estado
            if (mostrar && estadoSeleccionado && estadoSeleccionado !== 'all') {
                if (estado !== estadoSeleccionado) {
                    mostrar = false;
                }
            }

            // Aplicar visibilidad
            fila.style.display = mostrar ? '' : 'none';
        });

        // Mostrar mensaje si no hay resultados
        mostrarMensajeSinResultados();
    }

    // ========================================
    // Mostrar mensaje cuando no hay resultados
    // ========================================
    function mostrarMensajeSinResultados() {
        // Remover mensaje anterior si existe
        const mensajeAnterior = tabla.querySelector('.no-results-row');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        // Verificar si hay filas visibles
        const filasVisibles = filasOriginales.filter(fila => fila.style.display !== 'none');
        
        if (filasVisibles.length === 0) {
            const tr = document.createElement('tr');
            tr.className = 'no-results-row';
            tr.innerHTML = `
                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    No se encontraron registros con los filtros aplicados
                </td>
            `;
            tabla.appendChild(tr);
        }
    }

    // ========================================
    // Limpiar filtros
    // ========================================
    function limpiarFiltros() {
        if (filtroFicha) filtroFicha.value = 'all';
        if (filtroDocumento) filtroDocumento.value = '';
        if (filtroFecha) filtroFecha.value = '';
        if (filtroEstado) filtroEstado.value = 'all';
        
        // Mostrar todas las filas
        filasOriginales.forEach(fila => {
            fila.style.display = '';
        });
        
        // Remover mensaje de sin resultados
        const mensajeAnterior = tabla.querySelector('.no-results-row');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
    }

    // ========================================
    // Exportar a CSV
    // ========================================
    function exportarCSV() {
        // Obtener filas visibles
        const filasVisibles = filasOriginales.filter(fila => fila.style.display !== 'none');
        
        if (filasVisibles.length === 0) {
            alert('No hay datos para exportar. Ajuste los filtros.');
            return;
        }

        // Encabezados
        let csv = 'Documento,Nombre,Ficha,Fecha,Estado\n';

        // Datos
        filasVisibles.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length === 0) return;

            const documento = celdas[0].textContent.trim();
            const nombre = celdas[1].textContent.trim().replace(/\s+/g, ' ');
            const fichaBadge = celdas[2].querySelector('.ficha-badge');
            const ficha = fichaBadge ? fichaBadge.textContent.trim() : 'N/D';
            const fecha = celdas[3].textContent.replace(/[^\d-]/g, '').trim();
            
            const estadoBadge = celdas[4].querySelector('.estado-badge');
            const estado = estadoBadge ? estadoBadge.textContent.trim() : '';

            // Escapar comas en el nombre
            const nombreEscapado = nombre.includes(',') ? `"${nombre}"` : nombre;

            csv += `${documento},${nombreEscapado},${ficha},${fecha},${estado}\n`;
        });

        // Crear y descargar archivo
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `asistencia_ambiente_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ========================================
    // Event Listeners
    // ========================================
    if (btnAplicar) {
        btnAplicar.addEventListener('click', aplicarFiltros);
    }

    if (btnExportar) {
        btnExportar.addEventListener('click', exportarCSV);
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltros);
    }

    // Filtro en tiempo real para documento/nombre
    if (filtroDocumento) {
        filtroDocumento.addEventListener('input', aplicarFiltros);
    }

    // Aplicar filtros al cambiar select de ficha
    if (filtroFicha) {
        filtroFicha.addEventListener('change', aplicarFiltros);
    }

    // Aplicar filtros al cambiar fecha
    if (filtroFecha) {
        filtroFecha.addEventListener('change', aplicarFiltros);
    }

    // Aplicar filtros al cambiar estado
    if (filtroEstado) {
        filtroEstado.addEventListener('change', aplicarFiltros);
    }
});
