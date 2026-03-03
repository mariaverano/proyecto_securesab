from django.shortcuts import render

# =============================================================================
# VISTAS PÚBLICAS
# =============================================================================

def landing(request):
    """Vista de landing page principal"""
    return render(request, 'landing.html')


def login_view(request):
    """Vista de login"""
    return render(request, 'login.html')


# =============================================================================
# VISTAS DE COORDINACIÓN - REPORTE Y MONITOREO
# =============================================================================

def inicio(request):
    """Vista de inicio/dashboard de coordinación"""
    return render(request, 'coordinacion/inicio.html')


def index(request):
    """Vista principal de reporte y monitoreo"""
    return render(request, 'coordinacion/index.html')


def asistencia_ambiente(request):
    """Vista de asistencia por ambiente"""
    return render(request, 'coordinacion/asistencia-ambiente.html')


def asistencia_sede(request):
    """Vista de asistencia por sede"""
    return render(request, 'coordinacion/asistencia-sede.html')


def crear_novedad(request):
    """Vista para crear novedades"""
    return render(request, 'coordinacion/crear-novedad.html')


def justificaciones(request):
    """Vista de justificaciones"""
    return render(request, 'coordinacion/justificaciones.html')


def mi_perfil(request):
    """Vista de perfil del usuario"""
    return render(request, 'coordinacion/mi-perfil.html')
