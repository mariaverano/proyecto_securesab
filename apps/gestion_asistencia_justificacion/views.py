from django.shortcuts import render

# Create your views here.

def index(request):
    """Vista principal de gestión de asistencia y justificación"""
    return render(request, 'gestion_asistencia_justificacion/index.html')
