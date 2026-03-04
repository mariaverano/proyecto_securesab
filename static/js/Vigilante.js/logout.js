// logout.js - Funcionalidad de cierre de sesión

console.log('✅ logout.js CARGADO');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ logout.js - INICIALIZANDO');

    // Si necesitas confirmación antes de logout, descomenta esto:
    /*
    const logoutForms = document.querySelectorAll('form[action*="logout"]');
    
    logoutForms.forEach(form => {
        form.addEventListener('submit', (event) => {
            const confirmar = confirm('¿Estás seguro de que deseas cerrar sesión?');
            if (!confirmar) {
                event.preventDefault();
                console.log('✅ Logout cancelado por el usuario');
            } else {
                console.log('✅ Cerrando sesión...');
            }
        });
    });
    */

    console.log('✅ logout.js - CONFIGURACIÓN COMPLETADA');
});
