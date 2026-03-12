/* =====================================================
   CREAR NOVEDAD - Lógica JavaScript
   SecureSab - Sistema de Control de Asistencia SENA
   ===================================================== */

// =====================================================
// VARIABLES GLOBALES
// =====================================================
let novedadesData = [];
let novedadSeleccionada = null;
let modoEdicion = false;

// =====================================================
// INICIALIZACIÓN
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
    initUserDropdown();
    initKPIs();
    cargarNovedades();
    cargarFichas();
    cargarInstructores();
    initFiltros();
    initModal();
    initToastContainer();
});

// =====================================================
// CARGAR DATOS DESDE EL SERVIDOR
// =====================================================
async function cargarNovedades() {
    try {
        const response = await fetch('/api/novedades/');
        const data = await response.json();
        
        if (data.success) {
            novedadesData = data.novedades;
            renderTabla();
            if (data.stats) {
                actualizarKPIsConDatos(data.stats);
            }
        } else {
            mostrarToast('error', 'Error', 'No se pudieron cargar las novedades');
        }
    } catch (error) {
        console.error('Error al cargar novedades:', error);
        mostrarToast('error', 'Error', 'Error de conexión con el servidor');
    }
}

async function cargarFichas() {
    console.log('🔄 Cargando fichas desde la API...');
    try {
        const response = await fetch('/api/fichas/');
        console.log('📡 Respuesta de fichas:', response.status);
        const data = await response.json();
        console.log('📊 Datos de fichas:', data);
        
        if (data.success) {
            const selectFicha = document.querySelector('[name="id_ficha"]');
            console.log('🎯 Select ficha encontrado:', selectFicha);
            if (selectFicha) {
                selectFicha.innerHTML = '<option value="">Seleccionar ficha...</option>';
                data.fichas.forEach(ficha => {
                    const option = document.createElement('option');
                    option.value = ficha.id;
                    option.textContent = `${ficha.numero}${ficha.programa ? ' - ' + ficha.programa : ''}`;
                    selectFicha.appendChild(option);
                });
                console.log(`✅ ${data.fichas.length} fichas cargadas exitosamente`);
            }
        } else {
            console.error('❌ Error en la respuesta:', data.message);
        }
    } catch (error) {
        console.error('❌ Error al cargar fichas:', error);
    }
}

async function cargarInstructores() {
    console.log('🔄 Cargando instructores desde la API...');
    try {
        const response = await fetch('/api/instructores/');
        console.log('📡 Respuesta de instructores:', response.status);
        const data = await response.json();
        console.log('📊 Datos de instructores:', data);
        
        if (data.success) {
            const selectInstructor = document.querySelector('[name="id_instructor"]');
            console.log('🎯 Select instructor encontrado:', selectInstructor);
            if (selectInstructor) {
                selectInstructor.innerHTML = '<option value="">Seleccionar instructor...</option>';
                data.instructores.forEach(instructor => {
                    const option = document.createElement('option');
                    option.value = instructor.id;
                    option.textContent = `${instructor.nombre}${instructor.cedula ? ' - ' + instructor.cedula : ''}`;
                    selectInstructor.appendChild(option);
                });
                console.log(`✅ ${data.instructores.length} instructores cargados exitosamente`);
            }
        } else {
            console.error('❌ Error en la respuesta:', data.message);
        }
    } catch (error) {
        console.error('❌ Error al cargar instructores:', error);
    }
}

// =====================================================
// KPIs
// =====================================================
function initKPIs() {
    actualizarKPIs();
}

function actualizarKPIs() {
    const total = novedadesData.length;
    const pendientes = novedadesData.filter(n => n.estado === 'Pendiente').length;
    const enProceso = novedadesData.filter(n => n.estado === 'En proceso').length;
    const resueltas = novedadesData.filter(n => n.estado === 'Resuelto').length;

    animarNumero('kpiTotal', total);
    animarNumero('kpiPendientes', pendientes);
    animarNumero('kpiProceso', enProceso);
    animarNumero('kpiResueltas', resueltas);
}

function actualizarKPIsConDatos(stats) {
    animarNumero('kpiTotal', stats.total || 0);
    animarNumero('kpiPendientes', stats.pendientes || 0);
    animarNumero('kpiProceso', stats.enProceso || 0);
    animarNumero('kpiResueltas', stats.resueltas || 0);
}

function animarNumero(elementId, valorFinal) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const duracion = 800;
    const inicio = performance.now();
    const valorInicial = parseInt(el.textContent) || 0;
    
    function actualizar(tiempoActual) {
        const progreso = Math.min((tiempoActual - inicio) / duracion, 1);
        const easing = 1 - Math.pow(1 - progreso, 3);
        const valorActual = Math.round(valorInicial + (valorFinal - valorInicial) * easing);
        el.textContent = valorActual;
        
        if (progreso < 1) {
            requestAnimationFrame(actualizar);
        }
    }
    
    requestAnimationFrame(actualizar);
}

// =====================================================
// RENDERIZADO DE TABLA
// =====================================================
function renderTabla(datos = novedadesData) {
    const tbody = document.getElementById('novTablaBody');
    if (!tbody) return;

    if (datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="nov-empty-state">
                        <i class="fas fa-inbox"></i>
                        <h4>No hay novedades</h4>
                        <p>No se encontraron novedades con los filtros aplicados</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = datos.map(novedad => `
        <tr data-id="${novedad.id}" data-estado="${novedad.estado}">
            <td>${formatearFecha(novedad.fecha)}</td>
            <td><strong>${novedad.ficha}</strong></td>
            <td>
                <div>
                    <strong>${novedad.titulo}</strong>
                    <span class="nov-tipo ${novedad.tipo.toLowerCase()}">${novedad.tipo}</span>
                </div>
            </td>
            <td class="nov-descripcion-cell">${truncarTexto(novedad.descripcion, 50)}</td>
            <td class="nov-respuesta-cell">
                ${novedad.respuesta 
                    ? `<span class="nov-respuesta-text">${truncarTexto(novedad.respuesta, 40)}</span>` 
                    : `<span class="nov-sin-respuesta">Sin respuesta</span>`
                }
            </td>
            <td>${novedad.instructor}</td>
            <td>
                <span class="nov-estado ${getEstadoClass(novedad.estado)}">${novedad.estado}</span>
            </td>
            <td class="nov-adjunto-cell">
                ${novedad.archivo 
                    ? `<a href="#" class="nov-adjunto-link" title="${novedad.archivo}"><i class="fas fa-paperclip"></i> ${getFileIcon(novedad.archivo)}</a>` 
                    : `<span class="nov-sin-adjunto">-</span>`
                }
            </td>
            <td>
                <div class="nov-acciones">
                    <button class="nov-btn-accion ver" onclick="verNovedad(${novedad.id})" title="Ver detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="nov-btn-accion editar" onclick="editarNovedad(${novedad.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="nov-btn-accion eliminar" onclick="confirmarEliminar(${novedad.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    actualizarPaginacion(datos.length);
}

function getEstadoClass(estado) {
    const clases = {
        'Pendiente': 'pendiente',
        'En proceso': 'proceso',
        'Resuelto': 'resuelto'
    };
    return clases[estado] || '';
}

function getFileIcon(archivo) {
    if (!archivo) return '';
    const ext = archivo.split('.').pop().toLowerCase();
    const iconos = {
        'pdf': '<i class="fas fa-file-pdf" style="color: #ef4444;"></i>',
        'doc': '<i class="fas fa-file-word" style="color: #3b82f6;"></i>',
        'docx': '<i class="fas fa-file-word" style="color: #3b82f6;"></i>',
        'xls': '<i class="fas fa-file-excel" style="color: #10b981;"></i>',
        'xlsx': '<i class="fas fa-file-excel" style="color: #10b981;"></i>',
        'jpg': '<i class="fas fa-file-image" style="color: #8b5cf6;"></i>',
        'jpeg': '<i class="fas fa-file-image" style="color: #8b5cf6;"></i>',
        'png': '<i class="fas fa-file-image" style="color: #8b5cf6;"></i>'
    };
    return iconos[ext] || '<i class="fas fa-file"></i>';
}

function formatearFecha(fecha) {
    const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

function truncarTexto(texto, maxLength) {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
}

function actualizarPaginacion(total) {
    const info = document.getElementById('paginacionInfo');
    if (info) {
        info.textContent = `Mostrando ${total} de ${novedadesData.length} novedades`;
    }
}

// =====================================================
// FILTROS Y BÚSQUEDA
// =====================================================
function initFiltros() {
    // Búsqueda
    const searchInput = document.getElementById('novSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(aplicarFiltros, 300));
    }

    // Filtro por estado
    const filtroEstado = document.getElementById('filtroEstado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', aplicarFiltros);
    }

    // Filtro por tipo
    const filtroTipo = document.getElementById('filtroTipo');
    if (filtroTipo) {
        filtroTipo.addEventListener('change', aplicarFiltros);
    }
}

function aplicarFiltros() {
    const busqueda = document.getElementById('novSearchInput')?.value.toLowerCase() || '';
    const estado = document.getElementById('filtroEstado')?.value || '';
    const tipo = document.getElementById('filtroTipo')?.value || '';

    let datosFiltrados = novedadesData.filter(novedad => {
        const coincideBusqueda = !busqueda || 
            novedad.titulo.toLowerCase().includes(busqueda) ||
            novedad.descripcion.toLowerCase().includes(busqueda) ||
            novedad.ficha.includes(busqueda) ||
            novedad.instructor.toLowerCase().includes(busqueda);

        const coincideEstado = !estado || novedad.estado === estado;
        const coincideTipo = !tipo || novedad.tipo === tipo;

        return coincideBusqueda && coincideEstado && coincideTipo;
    });

    renderTabla(datosFiltrados);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =====================================================
// MODAL
// =====================================================
function initModal() {
    const modal = document.getElementById('novModal');
    const btnNueva = document.getElementById('btnNuevaNovedad');
    const btnCerrar = document.getElementById('novModalClose');
    const btnCancelar = document.getElementById('novModalCancel');
    const form = document.getElementById('formNovedad');
    const archivoInput = document.getElementById('archivoInput');

    if (btnNueva) {
        btnNueva.addEventListener('click', () => abrirModalNueva());
    }

    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarModal);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', cerrarModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal();
        });
    }

    if (form) {
        form.addEventListener('submit', guardarNovedad);
    }
    
    // Mostrar nombre del archivo seleccionado
    if (archivoInput) {
        archivoInput.addEventListener('change', function() {
            const fileLabel = document.querySelector('.nov-file-label span');
            if (fileLabel) {
                if (this.files && this.files.length > 0) {
                    fileLabel.textContent = this.files[0].name;
                    fileLabel.style.color = '#10b981';
                } else {
                    fileLabel.textContent = 'Arrastra o haz clic para adjuntar archivo';
                    fileLabel.style.color = '';
                }
            }
        });
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModal();
    });
}

function abrirModalNueva() {
    modoEdicion = false;
    novedadSeleccionada = null;
    
    const modal = document.getElementById('novModal');
    const titulo = document.getElementById('modalTitulo');
    const form = document.getElementById('formNovedad');
    
    if (titulo) titulo.textContent = 'Nueva Novedad';
    if (form) form.reset();
    
    // Limpiar errores de validación
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
    
    // Resetear label del archivo
    const fileLabel = document.querySelector('.nov-file-label span');
    if (fileLabel) {
        fileLabel.textContent = 'Arrastra o haz clic para adjuntar archivo';
        fileLabel.style.color = '';
    }
    
    if (modal) modal.classList.add('active');
}

function verNovedad(id) {
    const novedad = novedadesData.find(n => n.id === id);
    if (!novedad) return;

    novedadSeleccionada = novedad;
    modoEdicion = false;

    const modal = document.getElementById('novModal');
    const titulo = document.getElementById('modalTitulo');
    
    if (titulo) titulo.textContent = 'Detalle de Novedad';
    
    // Llenar formulario (solo lectura)
    llenarFormulario(novedad);
    deshabilitarFormulario(true);
    
    if (modal) modal.classList.add('active');
}

function editarNovedad(id) {
    const novedad = novedadesData.find(n => n.id === id);
    if (!novedad) return;

    novedadSeleccionada = novedad;
    modoEdicion = true;

    const modal = document.getElementById('novModal');
    const titulo = document.getElementById('modalTitulo');
    
    if (titulo) titulo.textContent = 'Editar Novedad';
    
    llenarFormulario(novedad);
    deshabilitarFormulario(false);
    
    if (modal) modal.classList.add('active');
}

function llenarFormulario(novedad) {
    const form = document.getElementById('formNovedad');
    if (!form) return;

    // Usar IDs de la base de datos
    const fichaSelect = form.querySelector('[name="id_ficha"]');
    if (fichaSelect && novedad.id_ficha) {
        fichaSelect.value = novedad.id_ficha;
    }
    
    const instructorSelect = form.querySelector('[name="id_instructor"]');
    if (instructorSelect && novedad.id_instructor) {
        instructorSelect.value = novedad.id_instructor;
    }
    
    form.querySelector('[name="titulo"]').value = novedad.titulo;
    form.querySelector('[name="descripcion"]').value = novedad.descripcion;
    form.querySelector('[name="tipo"]').value = novedad.tipo;
    form.querySelector('[name="estado"]').value = novedad.estado;
    
    // Llenar respuesta si existe
    const respuestaField = form.querySelector('[name="respuesta"]');
    if (respuestaField) {
        respuestaField.value = novedad.respuesta || '';
    }
    
    // Mostrar nombre del archivo si existe
    const fileLabel = form.querySelector('.nov-file-label span');
    if (fileLabel && novedad.archivo) {
        fileLabel.textContent = novedad.archivo;
    }
}

function deshabilitarFormulario(disabled) {
    const form = document.getElementById('formNovedad');
    const btnGuardar = document.getElementById('novModalSave');
    
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.disabled = disabled;
    });

    if (btnGuardar) {
        btnGuardar.style.display = disabled ? 'none' : 'inline-flex';
    }
}

function cerrarModal() {
    const modal = document.getElementById('novModal');
    if (modal) {
        modal.classList.remove('active');
        novedadSeleccionada = null;
        modoEdicion = false;
        deshabilitarFormulario(false);
        
        // Limpiar errores de validación
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
    }
}

async function guardarNovedad(e) {
    e.preventDefault();

    const form = e.target;
    const btnGuardar = document.getElementById('novModalSave');
    
    // Deshabilitar botón mientras se procesa
    if (btnGuardar) {
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }
    
    // Obtener archivo adjunto
    const archivoInput = form.querySelector('[name="archivo"]');
    let archivoNombre = null;
    if (archivoInput && archivoInput.files && archivoInput.files.length > 0) {
        archivoNombre = archivoInput.files[0].name;
    }
    
    // Obtener respuesta
    const respuestaField = form.querySelector('[name="respuesta"]');
    const respuesta = respuestaField ? respuestaField.value.trim() : '';
    
    const datos = {
        id_ficha: form.querySelector('[name="id_ficha"]').value || null,
        id_instructor: form.querySelector('[name="id_instructor"]').value,
        titulo: form.querySelector('[name="titulo"]').value,
        descripcion: form.querySelector('[name="descripcion"]').value,
        tipo: form.querySelector('[name="tipo"]').value,
        estado: form.querySelector('[name="estado"]').value,
        respuesta: respuesta || '',
        archivo: archivoNombre || ''
    };

    try {
        if (modoEdicion && novedadSeleccionada) {
            // Actualizar existente
            const response = await fetch(`/api/novedades/${novedadSeleccionada.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarToast('success', 'Novedad actualizada', 'Los cambios se guardaron correctamente');
                await cargarNovedades();
                cerrarModal();
            } else {
                // Manejar errores de validación
                if (result.errors) {
                    mostrarErroresValidacion(result.errors);
                } else {
                    mostrarToast('error', 'Error', result.message || 'No se pudo actualizar la novedad');
                }
            }
        } else {
            // Crear nueva
            const response = await fetch('/api/novedades/crear/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarToast('success', 'Novedad creada', 'La novedad se registró correctamente');
                await cargarNovedades();
                cerrarModal();
            } else {
                // Manejar errores de validación
                if (result.errors) {
                    mostrarErroresValidacion(result.errors);
                } else {
                    mostrarToast('error', 'Error', result.message || 'No se pudo crear la novedad');
                }
            }
        }
    } catch (error) {
        console.error('Error al guardar novedad:', error);
        mostrarToast('error', 'Error', 'Error de conexión con el servidor');
    } finally {
        // Rehabilitar botón
        if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar';
        }
    }
}

// =====================================================
// ELIMINAR
// =====================================================
function confirmarEliminar(id) {
    const novedad = novedadesData.find(n => n.id === id);
    if (!novedad) return;

    if (confirm(`¿Estás seguro de eliminar la novedad "${novedad.titulo}"?`)) {
        eliminarNovedad(id);
    }
}

async function eliminarNovedad(id) {
    try {
        const response = await fetch(`/api/novedades/${id}/`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarToast('success', 'Novedad eliminada', 'La novedad se eliminó correctamente');
            await cargarNovedades();
        } else {
            mostrarToast('error', 'Error', result.message || 'No se pudo eliminar la novedad');
        }
    } catch (error) {
        console.error('Error al eliminar novedad:', error);
        mostrarToast('error', 'Error', 'Error de conexión con el servidor');
    }
}

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================
function initToastContainer() {
    if (!document.querySelector('.nov-toast-container')) {
        const container = document.createElement('div');
        container.className = 'nov-toast-container';
        document.body.appendChild(container);
    }
}

// =====================================================
// MOSTRAR ERRORES DE VALIDACIÓN
// =====================================================
function mostrarErroresValidacion(errors) {
    // Limpiar errores previos
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
    
    if (!errors || Object.keys(errors).length === 0) return;
    
    // Mostrar errores para cada campo
    for (const [field, messages] of Object.entries(errors)) {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
            input.classList.add('form-error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '12px';
            errorDiv.style.marginTop = '4px';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${messages.join(', ')}`;
            input.parentElement.appendChild(errorDiv);
        }
    }
    
    // Mostrar un toast general
    const primerError = Object.values(errors)[0];
    mostrarToast('error', 'Error de validación', primerError[0] || 'Por favor revisa los campos del formulario');
}

function mostrarToast(tipo, titulo, mensaje) {
    const container = document.querySelector('.nov-toast-container');
    if (!container) return;

    const iconos = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `nov-toast ${tipo}`;
    toast.innerHTML = `
        <i class="nov-toast-icon ${iconos[tipo]}"></i>
        <div class="nov-toast-content">
            <div class="nov-toast-title">${titulo}</div>
            <div class="nov-toast-message">${mensaje}</div>
        </div>
        <button class="nov-toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// =====================================================
// EXPORTAR
// =====================================================
function exportarCSV() {
    const headers = ['Fecha', 'Ficha', 'Título', 'Descripción', 'Instructor', 'Tipo', 'Estado'];
    const rows = novedadesData.map(n => [
        n.fecha,
        n.ficha,
        `"${n.titulo}"`,
        `"${n.descripcion}"`,
        n.instructor,
        n.tipo,
        n.estado
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `novedades_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    mostrarToast('success', 'Exportación exitosa', 'El archivo CSV se descargó correctamente');
}

// Agregar animación de salida para toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);
