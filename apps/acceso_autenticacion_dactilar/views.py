from django.shortcuts import render

def index(request):
    return render(request, 'acceso_autenticacion_dactilar/index.html')
