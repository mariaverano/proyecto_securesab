from django.shortcuts import render

# Create your views here.

def index(request):
    """Vista principal de seguridad y administración"""
    return render(request, 'seguridad_administracion/index.html')
