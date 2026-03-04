from django.shortcuts import render

def index(request):
    return render(request, 'gestion_asistencia_justificacion/index.html')
