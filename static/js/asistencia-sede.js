// ========================================
// Lógica de filtros y exportación - Asistencia Sede
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Cargar fichas desde la base de datos
    cargarFichasDesdeAPI();
    
    // Referencias a elementos
    const tabla = document.getElementById('asistenciaSedeTabla');
    const filtroFicha = document.getElementById('asistenciaSedeFicha');
    const filtroDocumento = document.getElementById('asistenciaSedeDocumento');
    const filtroFecha = document.getElementById('fechaFiltro');
    const filtroHoraEntrada = document.getElementById('horaEntrada');
    const filtroHoraSalida = document.getElementById('horaSalida');
    const btnAplicar = document.getElementById('applySedeFiltersBtn');
    const btnExportar = document.getElementById('exportSedeBtn');

    // Guardar todas las filas originales (solo una vez)
    let filasOriginales = [];
    if (tabla) {
        // Obtener solo filas con datos (que tengan celdas td)
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
        const horaEntradaFiltro = filtroHoraEntrada ? filtroHoraEntrada.value : '';
        const horaSalidaFiltro = filtroHoraSalida ? filtroHoraSalida.value : '';

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
            
            // Extraer hora de entrada
            const entradaBadge = celdas[4].querySelector('.time-badge');
            const horaEntradaTexto = entradaBadge ? entradaBadge.textContent.replace(/[^\d:]/g, '').trim() : '';
            
            // Extraer hora de salida
            const salidaBadge = celdas[5].querySelector('.time-badge');
            const horaSalidaTexto = salidaBadge ? salidaBadge.textContent.replace(/[^\d:]/g, '').trim() : '';

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

            // FILTRO 4: Por hora de entrada (>= hora especificada)
            if (mostrar && horaEntradaFiltro) {
                const horaEntradaNorm = normalizarHora(horaEntradaTexto);
                const horaFiltroNorm = normalizarHora(horaEntradaFiltro);
                
                if (horaEntradaNorm && horaFiltroNorm) {
                    if (horaEntradaNorm < horaFiltroNorm) {
                        mostrar = false;
                    }
                }
            }

            // FILTRO 5: Por hora de salida (<= hora especificada)
            if (mostrar && horaSalidaFiltro) {
                const horaSalidaNorm = normalizarHora(horaSalidaTexto);
                const horaFiltroNorm = normalizarHora(horaSalidaFiltro);
                
                // Si no tiene hora de salida válida, ocultar
                if (!horaSalidaNorm || horaSalidaNorm === '') {
                    mostrar = false;
                } else if (horaFiltroNorm && horaSalidaNorm > horaFiltroNorm) {
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
    // Normalizar hora a formato comparable (HH:MM)
    // ========================================
    function normalizarHora(hora) {
        if (!hora || hora === '--:--') return '';
        
        // Remover caracteres no numéricos excepto :
        hora = hora.replace(/[^\d:]/g, '');
        
        const partes = hora.split(':');
        if (partes.length >= 2) {
            const hh = partes[0].padStart(2, '0');
            const mm = partes[1].padStart(2, '0');
            return `${hh}:${mm}`;
        }
        return '';
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
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">
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
        if (filtroHoraEntrada) filtroHoraEntrada.value = '';
        if (filtroHoraSalida) filtroHoraSalida.value = '';
        
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
        let csv = 'Documento,Nombre,Ficha,Fecha,Hora Entrada,Hora Salida\n';

        // Datos
        filasVisibles.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length === 0) return;

            const documento = celdas[0].textContent.trim();
            const nombre = celdas[1].textContent.trim().replace(/\s+/g, ' ');
            const fichaBadge = celdas[2].querySelector('.ficha-badge');
            const ficha = fichaBadge ? fichaBadge.textContent.trim() : 'N/D';
            const fecha = celdas[3].textContent.replace(/[^\d-]/g, '').trim();
            
            const entradaBadge = celdas[4].querySelector('.time-badge');
            const horaEntrada = entradaBadge ? entradaBadge.textContent.replace(/[^\d:]/g, '').trim() : '';
            
            const salidaBadge = celdas[5].querySelector('.time-badge');
            const horaSalida = salidaBadge ? salidaBadge.textContent.replace(/[^\d:]/g, '').trim() : 'Pendiente';

            // Escapar comas en el nombre
            const nombreEscapado = nombre.includes(',') ? `"${nombre}"` : nombre;

            csv += `${documento},${nombreEscapado},${ficha},${fecha},${horaEntrada},${horaSalida}\n`;
        });

        // Crear y descargar archivo
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `asistencia_sede_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ========================================
    // Event Listeners
    // ========================================
    const btnLimpiar = document.getElementById('clearFiltersBtn');
    
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
        filtroDocumento.addEventListener('input', function() {
            // Aplicar filtros automáticamente al escribir
            aplicarFiltros();
        });
    }

    // También aplicar filtros al cambiar el select de ficha
    if (filtroFicha) {
        filtroFicha.addEventListener('change', aplicarFiltros);
    }

    // Aplicar filtros al cambiar fecha
    if (filtroFecha) {
        filtroFecha.addEventListener('change', aplicarFiltros);
    }

    // Aplicar filtros al cambiar horas
    if (filtroHoraEntrada) {
        filtroHoraEntrada.addEventListener('change', aplicarFiltros);
    }

    if (filtroHoraSalida) {
        filtroHoraSalida.addEventListener('change', aplicarFiltros);
    }
});
async function cargarFichasDesdeAPI() {
    console.log('🔄 Cargando fichas desde la base de datos...');
    try {
        const response = await fetch('/api/fichas/');
        const data = await response.json();
        
        if (data.success && data.fichas) {
            const selectFicha = document.getElementById('asistenciaSedeFicha');
            if (selectFicha) {
                // Mantener la opción "Todas las Fichas"
                selectFicha.innerHTML = '<option value="all">Todas las Fichas</option>';
                
                // Agregar las fichas desde la base de datos
                data.fichas.forEach(ficha => {
                    const option = document.createElement('option');
                    option.value = ficha.numero;
                    option.textContent = ficha.numero + (ficha.programa ? ' - ' + ficha.programa : '');
                    selectFicha.appendChild(option);
                });
                
                console.log(`✅ ${data.fichas.length} fichas cargadas exitosamente`);
            }
        } else {
            console.error('❌ Error en la respuesta de la API:', data.message || 'Sin mensaje');
        }
    } catch (error) {
        console.error('❌ Error al cargar fichas desde la API:', error);
    }
}