// login.js - Lógica del formulario de login

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const alertError = document.getElementById('alertError');
    const errorMessage = document.getElementById('errorMessage');

    // Usuarios de prueba (simulación) - el rol se detecta por la cédula
    const usuarios = [
        { cedula: '123456', password: '123456', nombre: 'Juan Coordinador', rol: 'coordinador' },
        { cedula: '234567', password: '123456', nombre: 'María Instructora', rol: 'instructor' },
        { cedula: '345678', password: '123456', nombre: 'Pedro Aprendiz', rol: 'aprendiz' },
        { cedula: '456789', password: '123456', nombre: 'Carlos Vigilante', rol: 'vigilante' },
        { cedula: '1000856088', password: '123456', nombre: 'Usuario Demo', rol: 'coordinador' }
    ];

    // Manejar envío del formulario
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const cedula = document.getElementById('cedula').value.trim();
        const password = document.getElementById('password').value;

        // Ocultar error previo
        alertError.style.display = 'none';

        // Validar campos
        if (!cedula || !password) {
            showError('Por favor completa todos los campos');
            return;
        }

        // Buscar usuario por cédula
        const usuario = usuarios.find(u => u.cedula === cedula);

        if (usuario && password === usuario.password) {
            // Login exitoso - guardar sesión
            sessionStorage.setItem('usuario', JSON.stringify({
                cedula: cedula,
                nombre: usuario.nombre,
                rol: usuario.rol
            }));

            // Redirigir según el rol
            switch(usuario.rol) {
                case 'coordinador':
                    window.location.href = '/inicio/';
                    break;
                case 'instructor':
                    showError('Módulo de instructor en desarrollo');
                    break;
                case 'aprendiz':
                    showError('Módulo de aprendiz en desarrollo');
                    break;
                case 'vigilante':
                    showError('Módulo de vigilante en desarrollo');
                    break;
                default:
                    showError('Rol no válido');
            }
        } else {
            showError('Cédula o contraseña incorrectas');
            shakeForm();
        }
    });

    // Mostrar mensaje de error
    function showError(message) {
        errorMessage.textContent = message;
        alertError.style.display = 'flex';
        alertError.style.animation = 'fadeIn 0.3s ease';
    }

    // Efecto de shake en el formulario
    function shakeForm() {
        loginForm.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            loginForm.style.animation = '';
        }, 500);
    }

    // Limpiar error al escribir
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            alertError.style.display = 'none';
        });
    });
});
