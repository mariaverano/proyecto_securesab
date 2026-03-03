// Archivo logicaC.js
console.log('logicaC.js cargado');

// ============ Filtros para Asistencia Sede ============
function initFiltrosAsistencia() {
    const btn = document.getElementById('applySedeFiltersBtn');
    const tabla = document.getElementById('asistenciaSedeTabla');
    if (!btn || !tabla) return;

    btn.addEventListener('click', function() {
        const selectFicha = document.getElementById('asistenciaSedeFicha');
        const fichaSeleccionada = selectFicha ? selectFicha.value : 'all';
        const filas = tabla.querySelectorAll('tr');
        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length < 3) return;
            const ficha = (celdas[2].textContent || '').trim();
            fila.style.display = (fichaSeleccionada === 'all' || ficha === fichaSeleccionada) ? '' : 'none';
        });
    });
}

// ============ Gráficos del Dashboard (Chart.js) ============
function initDashboardCharts() {
    const hasChartLib = !!(window.Chart);
    const data = window.dashboardData || {};

    if (hasChartLib) {
        Chart.defaults.color = '#374151';
        Chart.defaults.font.family = 'system-ui, sans-serif';

        // Gráfico de Asistencias
        if (document.getElementById('asistenciasChart')) {
            new Chart(document.getElementById('asistenciasChart'), {
                type: 'bar',
                data: {
                    labels: ['Sede presentes', 'Ambiente presentes', 'Ambiente ausentes'],
                    datasets: [{
                        label: 'Hoy',
                        data: data.asistencias?.data || [0, 0, 0],
                        backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
                        borderRadius: 8
                    }]
                }
            });
        }

        // Gráfico de Novedades
        if (document.getElementById('novedadesChart')) {
            new Chart(document.getElementById('novedadesChart'), {
                type: 'doughnut',
                data: {
                    labels: ['Pendiente', 'En proceso', 'Cerrado'],
                    datasets: [{
                        data: data.novedades?.data || [0, 0, 0],
                        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981']
                    }]
                },
                options: { cutout: '60%' }
            });
        }

        // Gráfico de Justificaciones
        if (document.getElementById('justificacionesChart')) {
            new Chart(document.getElementById('justificacionesChart'), {
                type: 'pie',
                data: {
                    labels: ['Pendiente', 'Aprobado', 'Rechazado'],
                    datasets: [{
                        data: data.justificaciones?.data || [0, 0, 0],
                        backgroundColor: ['#f59e0b', '#10b981', '#ef4444']
                    }]
                }
            });
        }
    }
}

// ============ Gráficos en página Asistencia Sede ============
function initSedeCharts() {
    // Estado: presente vs ausente
    // Llegadas por franja horaria
}

// ============ Gráficos en página Asistencia Ambiente ============
function initAmbienteCharts() {
    // Estado en ambiente
    // Top fichas con registros
}

// ============ User Dropdown Menu ============
function initUserDropdown() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (!userMenuBtn || !userDropdown || userMenuBtn.dataset.init) return;
    userMenuBtn.dataset.init = 'true';
    
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userMenuBtn.classList.toggle('active');
        userDropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', function(e) {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userMenuBtn.classList.remove('active');
            userDropdown.classList.remove('active');
        }
    });
}

// ============ Sidebar Toggle ============
function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (!sidebarToggle || !sidebar || sidebarToggle.dataset.init) return;
    sidebarToggle.dataset.init = 'true';
    
    // Recuperar estado guardado
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        // Guardar estado
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
}

// Ejecutar cuando el DOM esté listo
function onReady() {
    initFiltrosAsistencia();
    initDashboardCharts();
    initSedeCharts();
    initAmbienteCharts();
    initUserDropdown();
    initSidebarToggle();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
} else {
    onReady();
}