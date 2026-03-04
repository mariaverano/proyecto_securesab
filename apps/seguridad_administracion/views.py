from django.shortcuts import render

def index(request):
    return render(request, 'seguridad_administracion/index.html')
