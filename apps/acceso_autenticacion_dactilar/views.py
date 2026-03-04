from django.shortcuts import render

# Create your views here.

def index(request):
    """Vista principal de acceso y autenticación dactilar"""
    return render(request, 'acceso_autenticacion_dactilar/index.html')


# =============================================================================
# VISTAS DE VIGILANTE
# =============================================================================

def vigilante_index(request):
    """Vista principal del vigilante"""
    return render(request, 'vigilante/index.html')


def consultar_invitados(request):
    """Vista para consultar invitados"""
    from datetime import datetime
    
    context = {
        'fechaHoy': datetime.now().strftime('%Y-%m-%d'),
        'horaAhora': datetime.now().strftime('%H:%M'),
        'visitantes': [],  # Lista vacía por ahora
        'totalPages': 0,
        'currentPage': 0,
        'pageNumbers': [],
    }
    
    return render(request, 'vigilante/consultar-invitados.html', context)


def historial_registro(request):
    """Vista del historial de registros"""
    from datetime import datetime
    
    context = {
        'fechaHoy': datetime.now().strftime('%Y-%m-%d'),
        'horaAhora': datetime.now().strftime('%H:%M'),
        'registros': [],  # Lista vacía por ahora
        'totalPages': 0,
        'currentPage': 0,
        'pageNumbers': [],
    }
    
    return render(request, 'vigilante/historial-registro.html', context)


def registrar_invitados(request):
    """Vista para registrar invitados"""
    from datetime import datetime
    
    context = {
        'fechaHoy': datetime.now().strftime('%Y-%m-%d'),
        'horaAhora': datetime.now().strftime('%H:%M'),
    }
    
    return render(request, 'vigilante/registrar-invitados.html', context)


def registrar_manual(request):
    """Vista para registro manual"""
    from datetime import datetime
    
    context = {
        'fechaHoy': datetime.now().strftime('%Y-%m-%d'),
        'horaAhora': datetime.now().strftime('%H:%M'),
        'registrosList': [],  # Lista vacía por ahora
        'totalPages': 0,
        'currentPage': 0,
    }
    
    return render(request, 'vigilante/registrar.manual.html', context)


def salida_invitado(request, invitado_id):
    """Vista para registrar la salida de un invitado"""
    # Por ahora solo renderiza, se puede agregar lógica después
    return render(request, 'vigilante/consultar-invitados.html')


def perfil(request):
    """Vista del perfil del vigilante"""
    # Datos de ejemplo - reemplazar con datos reales del usuario
    usuario = {
        'nombre': 'Juan',
        'apellido': 'Pérez',
        'correo': 'vigilante@securesab.com',
        'telefono': '300 123 4567'
    }
    return render(request, 'vigilante/perfil.html', {'usuario': usuario})


def actualizar_foto_perfil(request):
    """Vista para actualizar la foto de perfil"""
    if request.method == 'POST':
        # Aquí iría la lógica para guardar la foto
        # Por ahora solo redirige con mensaje de éxito
        from django.shortcuts import redirect
        return redirect('vigilante:perfil')
    return redirect('vigilante:perfil')
