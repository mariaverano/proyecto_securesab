from django.shortcuts import render

# Create your views here.

def landing(request):
    """Vista de landing page principal"""
    return render(request, 'landing.html')

def login(request):
    """Vista de login"""
    return render(request, 'login.html')

def inicio(request):
    """Vista de inicio/dashboard"""
    return render(request, 'inicio.html')

def index(request):
    """Vista principal de reporte y monitoreo"""
    return render(request, 'reporte_monitoreo/index.html')

def asistencia_ambiente(request):
    """Vista de asistencia por ambiente"""
    return render(request, 'asistencia-ambiente.html')

def asistencia_sede(request):
    """Vista de asistencia por sede"""
    return render(request, 'asistencia-sede.html')

def crear_novedad(request):
    """Vista para crear novedades"""
    return render(request, 'crear-novedad.html')

def justificaciones(request):
    """Vista de justificaciones"""
    return render(request, 'justificaciones.html')

def mi_perfil(request):
    """Vista de perfil del usuario"""
    return render(request, 'mi-perfil.html')
