// logicaV.js - Lógica JavaScript específica para el rol de Vigilante

console.log('✅ logicaV.js CARGADO');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ logicaV.js - INICIALIZANDO');

    // --- Selectores de elementos del layout principal ---
    const userAvatarContainer = document.querySelector('.user-avatar-container');
    const userDropdown = document.getElementById('userDropdown');

    // --- MANEJO DEL DROPDOWN DEL USUARIO ---
    if (userAvatarContainer && userDropdown) {
        console.log('✅ Configurando dropdown del usuario...');

        userAvatarContainer.addEventListener('click', (event) => {
            event.stopPropagation();
            const isShowing = userDropdown.classList.toggle('show');
            console.log('✅ Dropdown del usuario toggled:', isShowing ? 'visible' : 'oculto');
        });

        // Cerrar menú al presionar ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && userDropdown.classList.contains('show')) {
                userDropdown.classList.remove('show');
                console.log('✅ Dropdown cerrado con ESC');
            }
        });

        // Cerrar el dropdown si se hace clic fuera
        document.addEventListener('click', (event) => {
            if (!userAvatarContainer.contains(event.target) &&
                !userDropdown.contains(event.target) &&
                userDropdown.classList.contains('show')) {
                userDropdown.classList.remove('show');
                console.log('✅ Dropdown cerrado (clic fuera)');
            }
        });
    } else {
        console.warn('⚠️ No se encontró el contenedor del usuario o el dropdown');
    }

    console.log('✅ logicaV.js - CONFIGURACIÓN COMPLETADA');
});

