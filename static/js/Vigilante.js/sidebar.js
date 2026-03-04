// sidebar.js - Manejo del menú lateral (sidebar)

console.log('✅ sidebar.js CARGADO');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ sidebar.js - INICIALIZANDO');

    const toggleBtn = document.getElementById('toggleMenuBtn');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        console.log('✅ Configurando toggle del sidebar...');

        toggleBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const isActive = sidebar.classList.toggle('active');
            toggleBtn.setAttribute('aria-expanded', isActive);
            console.log('✅ Sidebar toggled:', isActive ? 'visible' : 'oculto');
        });

        // Cerrar sidebar al hacer clic fuera (solo en móvil)
        document.addEventListener('click', (event) => {
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('active') &&
                !sidebar.contains(event.target) &&
                !toggleBtn.contains(event.target)) {
                sidebar.classList.remove('active');
                toggleBtn.setAttribute('aria-expanded', 'false');
                console.log('✅ Sidebar cerrado (clic fuera)');
            }
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                toggleBtn.setAttribute('aria-expanded', 'false');
                console.log('✅ Sidebar cerrado con ESC');
            }
        });
    } else {
        console.warn('⚠️ No se encontró el botón toggle o el sidebar');
    }

    console.log('✅ sidebar.js - CONFIGURACIÓN COMPLETADA');
});
