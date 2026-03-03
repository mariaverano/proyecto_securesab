/* =====================================================
   JUSTIFICACIONES - Lógica y funcionalidad
   SecureSab - Sistema de Control de Asistencia SENA
   ===================================================== */

// ===== Datos de ejemplo =====
const justificacionesData = [
    {
        id: 1,
        asistenciaId: 1025,
        aprendiz: { nombre: 'María García López', documento: '1023456789', ficha: '2654123' },
        motivo: 'Cita médica',
        tipoMotivo: 'medico',
        soporte: 'certificado_medico.pdf',
        fecha: '2026-02-21',
        hora: '08:30 AM',
        estado: 'Pendiente',
        observaciones: 'Cita de control programada'
    },
    {
        id: 2,
        asistenciaId: 1024,
        aprendiz: { nombre: 'Carlos Rodríguez Pérez', documento: '1023456790', ficha: '2654123' },
        motivo: 'Calamidad doméstica',
        tipoMotivo: 'calamidad',
        soporte: 'documento_soporte.pdf',
        fecha: '2026-02-20',
        hora: '09:15 AM',
        estado: 'Aprobada',
        observaciones: 'Aprobado por coordinación - Situación verificada'
    },
    {
        id: 3,
        asistenciaId: 1023,
        aprendiz: { nombre: 'Ana Martínez Silva', documento: '1023456791', ficha: '2654124' },
        motivo: 'Problema de transporte',
        tipoMotivo: 'transporte',
        soporte: 'foto_evidencia.jpg',
        fecha: '2026-02-19',
        hora: '07:45 AM',
        estado: 'Rechazada',
        observaciones: 'Soporte insuficiente - No se evidencia la situación'
    },
    {
        id: 4,
        asistenciaId: 1022,
        aprendiz: { nombre: 'Pedro Sánchez Ruiz', documento: '1023456792', ficha: '2654125' },
        motivo: 'Enfermedad',
        tipoMotivo: 'medico',
        soporte: 'incapacidad.pdf',
        fecha: '2026-02-18',
        hora: '10:00 AM',
        estado: 'Pendiente',
        observaciones: 'Esperando validación de soporte'
    },
    {
        id: 5,
        asistenciaId: 1021,
        aprendiz: { nombre: 'Laura Torres Gómez', documento: '1023456793', ficha: '2654124' },
        motivo: 'Cita médica',
        tipoMotivo: 'medico',
        soporte: 'orden_medica.pdf',
        fecha: '2026-02-17',
        hora: '02:30 PM',
        estado: 'Aprobada',
        observaciones: 'Cita especialista - Documentación completa'
    },
    {
        id: 6,
        asistenciaId: 1020,
        aprendiz: { nombre: 'Diego Herrera Castro', documento: '1023456794', ficha: '2654125' },
        motivo: 'Trámite personal',
        tipoMotivo: 'otro',
        soporte: 'comprobante_tramite.pdf',
        fecha: '2026-02-16',
        hora: '11:20 AM',
        estado: 'Pendiente',
        observaciones: 'Trámite de documentos de identidad'
    }
];

// ===== Variables globales =====
let filtroActual = 'all';
let busquedaActual = '';
let justificacionSeleccionada = null;

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
    initUserDropdown();
    initKPIs();
    renderTabla();
    initFiltros();
    initBusqueda();
    initModal();
    initPaginacion();
});

// ===== KPIs =====
function initKPIs() {
    const total = justificacionesData.length;
    const pendientes = justificacionesData.filter(j => j.estado === 'Pendiente').length;
    const aprobadas = justificacionesData.filter(j => j.estado === 'Aprobada').length;
    const rechazadas = justificacionesData.filter(j => j.estado === 'Rechazada').length;

    document.getElementById('kpiTotal').textContent = total;
    document.getElementById('kpiPendientes').textContent = pendientes;
    document.getElementById('kpiAprobadas').textContent = aprobadas;
    document.getElementById('kpiRechazadas').textContent = rechazadas;

    // Actualizar contadores en chips
    document.querySelector('[data-estado="all"] .chip-count').textContent = total;
    document.querySelector('[data-estado="Pendiente"] .chip-count').textContent = pendientes;
    document.querySelector('[data-estado="Aprobada"] .chip-count').textContent = aprobadas;
    document.querySelector('[data-estado="Rechazada"] .chip-count').textContent = rechazadas;
}

// ===== Renderizar Tabla =====
function renderTabla() {
    const tbody = document.getElementById('justTablaBody');
    const datosFiltrados = filtrarDatos();

    if (datosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="just-empty-state">
                        <div class="just-empty-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h4 class="just-empty-title">No se encontraron justificaciones</h4>
                        <p class="just-empty-text">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = datosFiltrados.map(j => `
        <tr data-id="${j.id}" data-estado="${j.estado}">
            <td class="just-id-cell">#${j.id}</td>
            <td>
                <div class="just-aprendiz-cell">
                    <span class="just-aprendiz-nombre">${j.aprendiz.nombre}</span>
                    <span class="just-aprendiz-doc">${j.aprendiz.documento} • Ficha ${j.aprendiz.ficha}</span>
                </div>
            </td>
            <td>
                <div class="just-motivo-cell">
                    <div class="just-motivo-icon ${j.tipoMotivo}">
                        <i class="fas ${getIconoMotivo(j.tipoMotivo)}"></i>
                    </div>
                    <span class="just-motivo-text">${j.motivo}</span>
                </div>
            </td>
            <td>
                <a href="#" class="just-soporte-link" onclick="verSoporte('${j.soporte}'); return false;">
                    <i class="fas fa-file-pdf"></i> Ver documento
                </a>
            </td>
            <td>
                <div class="just-fecha-cell">
                    <span class="just-fecha-date">${formatFecha(j.fecha)}</span>
                    <span class="just-fecha-time">${j.hora}</span>
                </div>
            </td>
            <td>
                <span class="just-estado-badge ${j.estado.toLowerCase()}">
                    <i class="fas fa-circle"></i> ${j.estado}
                </span>
            </td>
            <td>
                <div class="just-actions">
                    <button class="just-action-btn view" onclick="verDetalle(${j.id})" title="Ver detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== Filtrar Datos =====
function filtrarDatos() {
    return justificacionesData.filter(j => {
        const cumpleFiltro = filtroActual === 'all' || j.estado === filtroActual;
        const cumpleBusqueda = busquedaActual === '' || 
            j.aprendiz.nombre.toLowerCase().includes(busquedaActual.toLowerCase()) ||
            j.aprendiz.documento.includes(busquedaActual) ||
            j.motivo.toLowerCase().includes(busquedaActual.toLowerCase());
        return cumpleFiltro && cumpleBusqueda;
    });
}

// ===== Inicializar Filtros =====
function initFiltros() {
    document.querySelectorAll('.just-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.just-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            filtroActual = this.dataset.estado;
            renderTabla();
            updatePaginacionInfo();
        });
    });
}

// ===== Inicializar Búsqueda =====
function initBusqueda() {
    const searchInput = document.getElementById('justSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            busquedaActual = this.value.trim();
            renderTabla();
            updatePaginacionInfo();
        }, 300));
    }
}

// ===== Modal =====
function initModal() {
    const modal = document.getElementById('justModal');
    const closeBtn = document.getElementById('justModalClose');
    const cancelBtn = document.getElementById('justModalCancel');

    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', cerrarModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) cerrarModal();
        });
    }

    // Escape para cerrar
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') cerrarModal();
    });
}

function verDetalle(id) {
    justificacionSeleccionada = justificacionesData.find(j => j.id === id);
    if (!justificacionSeleccionada) return;

    const j = justificacionSeleccionada;
    
    document.getElementById('modalAprendiz').textContent = j.aprendiz.nombre;
    document.getElementById('modalDocumento').textContent = j.aprendiz.documento;
    document.getElementById('modalFicha').textContent = j.aprendiz.ficha;
    document.getElementById('modalMotivo').textContent = j.motivo;
    document.getElementById('modalFecha').textContent = `${formatFecha(j.fecha)} - ${j.hora}`;
    document.getElementById('modalEstado').innerHTML = `
        <span class="just-estado-badge ${j.estado.toLowerCase()}">
            <i class="fas fa-circle"></i> ${j.estado}
        </span>
    `;
    document.getElementById('modalObservaciones').textContent = j.observaciones || 'Sin observaciones';

    document.getElementById('justModal').classList.add('show');
}

function cerrarModal() {
    document.getElementById('justModal').classList.remove('show');
    justificacionSeleccionada = null;
}

// ===== Acciones =====
function aprobarJustificacion(id) {
    const j = justificacionesData.find(j => j.id === id);
    if (!j) return;

    const obs = document.getElementById('modalObsInput')?.value || 'Aprobado por coordinación';
    j.estado = 'Aprobada';
    j.observaciones = obs;

    cerrarModal();
    initKPIs();
    renderTabla();
    showToast('Justificación aprobada correctamente', 'success');
}

function rechazarJustificacion(id) {
    const j = justificacionesData.find(j => j.id === id);
    if (!j) return;

    const obs = document.getElementById('modalObsInput')?.value || 'Rechazado por coordinación';
    j.estado = 'Rechazada';
    j.observaciones = obs;

    cerrarModal();
    initKPIs();
    renderTabla();
    showToast('Justificación rechazada', 'warning');
}

function verSoporte(archivo) {
    showToast(`Abriendo documento: ${archivo}`, 'success');
    // En producción: window.open('/soportes/' + archivo, '_blank');
}

// ===== Paginación =====
function initPaginacion() {
    updatePaginacionInfo();
}

function updatePaginacionInfo() {
    const total = filtrarDatos().length;
    const info = document.getElementById('paginacionInfo');
    if (info) {
        info.textContent = `Mostrando ${total} de ${justificacionesData.length} justificaciones`;
    }
}

// ===== Exportar =====
function exportarCSV() {
    const datos = filtrarDatos();
    let csv = 'ID,Aprendiz,Documento,Ficha,Motivo,Fecha,Estado,Observaciones\n';
    
    datos.forEach(j => {
        csv += `${j.id},"${j.aprendiz.nombre}",${j.aprendiz.documento},${j.aprendiz.ficha},"${j.motivo}",${j.fecha},${j.estado},"${j.observaciones}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `justificaciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('Archivo CSV descargado', 'success');
}

// ===== Utilidades =====
function getIconoMotivo(tipo) {
    const iconos = {
        medico: 'fa-stethoscope',
        calamidad: 'fa-house-damage',
        transporte: 'fa-bus',
        otro: 'fa-file-alt'
    };
    return iconos[tipo] || iconos.otro;
}

function formatFecha(fecha) {
    const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    // Remover toast anterior si existe
    const existingToast = document.querySelector('.just-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `just-toast ${type}`;
    
    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle'
    };

    toast.innerHTML = `<i class="fas ${iconos[type] || iconos.success}"></i> ${message}`;
    document.body.appendChild(toast);

    // Mostrar
    setTimeout(() => toast.classList.add('show'), 10);

    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
