/* =====================================================
   CREAR NOVEDAD - Lógica JavaScript
   SecureSab - Sistema de Control de Asistencia SENA
   ===================================================== */

// =====================================================
// DATOS DE EJEMPLO
// =====================================================
let novedadesData = [
    {
        id: 1,
        fecha: '2026-02-21',
        ficha: '2654123',
        titulo: 'Falla en equipos de cómputo',
        descripcion: 'Los computadores del ambiente 301 presentan fallas al encender. Se requiere revisión técnica urgente.',
        instructor: 'Carlos Pérez',
        tipo: 'Urgente',
        estado: 'Pendiente',
        archivo: 'reporte_falla.pdf'
    },
    {
        id: 2,
        fecha: '2026-02-20',
        ficha: '2654124',
        titulo: 'Cambio de horario solicitado',
        descripcion: 'El grupo solicita cambio de jornada de mañana a tarde por motivos de transporte.',
        instructor: 'María López',
        tipo: 'Aviso',
        estado: 'En proceso',
        archivo: null
    },
    {
        id: 3,
        fecha: '2026-02-19',
        ficha: '2654125',
        titulo: 'Inasistencia masiva por paro',
        descripcion: 'Grupo completo no pudo asistir debido al paro de transporte en la zona norte.',
        instructor: 'Juan García',
        tipo: 'Incidencia',
        estado: 'Resuelto',
        archivo: 'justificacion_paro.pdf'
    },
    {
        id: 4,
        fecha: '2026-02-18',
        ficha: '2654123',
        titulo: 'Proyector dañado',
        descripcion: 'El proyector del ambiente presenta imagen borrosa y no proyecta correctamente.',
        instructor: 'Carlos Pérez',
        tipo: 'Incidencia',
        estado: 'Pendiente',
        archivo: null
    },
    {
        id: 5,
        fecha: '2026-02-17',
        ficha: '2654126',
        titulo: 'Conflicto entre aprendices',
        descripcion: 'Se presentó un altercado verbal entre dos aprendices durante la formación.',
        instructor: 'Ana Martínez',
        tipo: 'Urgente',
        estado: 'En proceso',
        archivo: 'acta_hechos.pdf'
    },
    {
        id: 6,
        fecha: '2026-02-16',
        ficha: '2654127',
        titulo: 'Solicitud de materiales',
        descripcion: 'Se requieren materiales adicionales para el proyecto final del trimestre.',
        instructor: 'Pedro Sánchez',
        tipo: 'Aviso',
        estado: 'Resuelto',
        archivo: 'lista_materiales.xlsx'
    }
];

// Novedad seleccionada para editar/ver
let novedadSeleccionada = null;
let modoEdicion = false;

// =====================================================
// INICIALIZACIÓN
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
    initUserDropdown();
    initKPIs();
    renderTabla();
    initFiltros();
    initModal();
    initToastContainer();
});

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
                <td colspan="7">
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
            <td>${novedad.instructor}</td>
            <td>
                <span class="nov-estado ${getEstadoClass(novedad.estado)}">${novedad.estado}</span>
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

    form.querySelector('[name="ficha"]').value = novedad.ficha;
    form.querySelector('[name="instructor"]').value = novedad.instructor;
    form.querySelector('[name="titulo"]').value = novedad.titulo;
    form.querySelector('[name="descripcion"]').value = novedad.descripcion;
    form.querySelector('[name="tipo"]').value = novedad.tipo;
    form.querySelector('[name="estado"]').value = novedad.estado;
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
    }
}

function guardarNovedad(e) {
    e.preventDefault();

    const form = e.target;
    const datos = {
        ficha: form.querySelector('[name="ficha"]').value,
        instructor: form.querySelector('[name="instructor"]').value,
        titulo: form.querySelector('[name="titulo"]').value,
        descripcion: form.querySelector('[name="descripcion"]').value,
        tipo: form.querySelector('[name="tipo"]').value,
        estado: form.querySelector('[name="estado"]').value,
        fecha: new Date().toISOString().split('T')[0]
    };

    if (modoEdicion && novedadSeleccionada) {
        // Actualizar existente
        const index = novedadesData.findIndex(n => n.id === novedadSeleccionada.id);
        if (index !== -1) {
            novedadesData[index] = { ...novedadesData[index], ...datos };
            mostrarToast('success', 'Novedad actualizada', 'Los cambios se guardaron correctamente');
        }
    } else {
        // Crear nueva
        const nuevaNovedad = {
            id: Math.max(...novedadesData.map(n => n.id)) + 1,
            ...datos,
            archivo: null
        };
        novedadesData.unshift(nuevaNovedad);
        mostrarToast('success', 'Novedad creada', 'La novedad se registró correctamente');
    }

    cerrarModal();
    actualizarKPIs();
    aplicarFiltros();
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

function eliminarNovedad(id) {
    novedadesData = novedadesData.filter(n => n.id !== id);
    mostrarToast('success', 'Novedad eliminada', 'La novedad se eliminó correctamente');
    actualizarKPIs();
    aplicarFiltros();
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
