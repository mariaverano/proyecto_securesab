from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from datetime import datetime
import json

from .models import Novedad, Usuarios, Ficha
from .forms import NovedadForm


# =============================================================================
# VISTAS PRINCIPALES
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
    """Vista para gestionar novedades - Renderiza la interfaz principal"""
    return render(request, 'coordinacion/crear-novedad.html')


def justificaciones(request):
    """Vista de justificaciones"""
    return render(request, 'coordinacion/justificaciones.html')


def mi_perfil(request):
    """Vista de perfil del usuario"""
    return render(request, 'coordinacion/mi-perfil.html')


# =============================================================================
# FUNCIONES AUXILIARES
# =============================================================================

def serializar_novedad(novedad):
    """Convierte una novedad a diccionario para respuesta JSON"""
    return {
        'id': novedad.id_novedad,
        'titulo': novedad.titulo or '',
        'descripcion': novedad.descripcion or '',
        'tipo': novedad.tipo or '',
        'fecha': novedad.fecha.strftime('%Y-%m-%d') if novedad.fecha else '',
        'estado': novedad.estado or 'Pendiente',
        'respuesta': novedad.respuesta or '',
        'respuesta_instructor': novedad.respuesta_instructor or '',
        'archivo': novedad.archivo_adjunto or '',
        'ficha': novedad.id_ficha.numeroficha if novedad.id_ficha else '',
        'id_ficha': novedad.id_ficha.id_ficha if novedad.id_ficha else None,
        'instructor': f"{novedad.id_instructor.nombre} {novedad.id_instructor.apellido}" if novedad.id_instructor else '',
        'id_instructor': novedad.id_instructor.id_usuario if novedad.id_instructor else None,
    }


def obtener_coordinador_actual(request):
    """
    Obtiene el coordinador del usuario en sesión
    TODO: Implementar autenticación real basada en request.user
    """
    return Usuarios.objects.first()


# =============================================================================
# API - LISTAR NOVEDADES
# =============================================================================

@csrf_exempt
@require_http_methods(["GET"])
def api_listar_novedades(request):
    """Lista todas las novedades con filtros opcionales"""
    try:
        # Parámetros de filtro
        search = request.GET.get('search', '')
        estado = request.GET.get('estado', '')
        tipo = request.GET.get('tipo', '')
        
        # Consulta base
        novedades = Novedad.objects.select_related(
            'id_coordinador', 'id_instructor', 'id_ficha'
        ).all().order_by('-fecha', '-id_novedad')
        
        # Aplicar filtros
        if search:
            novedades = novedades.filter(
                Q(titulo__icontains=search) |
                Q(descripcion__icontains=search) |
                Q(id_ficha__numeroficha__icontains=search) |
                Q(id_instructor__nombre__icontains=search) |
                Q(id_instructor__apellido__icontains=search)
            )
        
        if estado:
            novedades = novedades.filter(estado=estado)
        
        if tipo:
            novedades = novedades.filter(tipo=tipo)
        
        # Serializar
        novedades_data = [serializar_novedad(n) for n in novedades]
        
        # Estadísticas
        stats = {
            'total': Novedad.objects.count(),
            'pendientes': Novedad.objects.filter(estado='Pendiente').count(),
            'enProceso': Novedad.objects.filter(estado='En proceso').count(),
            'resueltas': Novedad.objects.filter(estado='Resuelto').count(),
        }
        
        return JsonResponse({
            'success': True,
            'message': 'Novedades obtenidas exitosamente',
            'novedades': novedades_data,
            'stats': stats
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al obtener novedades: {str(e)}'
        }, status=500)


# =============================================================================
# API - CREAR NOVEDAD
# =============================================================================

@csrf_exempt
@require_http_methods(["POST"])
def api_crear_novedad(request):
    """Crea una nueva novedad"""
    try:
        data = json.loads(request.body)
        
        # Obtener coordinador
        coordinador = obtener_coordinador_actual(request)
        if not coordinador:
            return JsonResponse({
                'success': False,
                'message': 'No se encontró un coordinador válido'
            }, status=400)
        
        # Validar formulario
        form = NovedadForm(data)
        
        if not form.is_valid():
            return JsonResponse({
                'success': False,
                'message': 'Error de validación',
                'errors': {field: [str(e) for e in errors] 
                          for field, errors in form.errors.items()}
            }, status=400)
        
        # Guardar novedad
        novedad = form.save(commit=False)
        novedad.id_coordinador = coordinador
        
        if not novedad.fecha:
            novedad.fecha = datetime.now().date()
        
        novedad.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Novedad creada exitosamente',
            'novedad': serializar_novedad(novedad)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Error al parsear los datos JSON'
        }, status=400)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al crear la novedad: {str(e)}'
        }, status=500)


# =============================================================================
# API - ACTUALIZAR NOVEDAD
# =============================================================================

@csrf_exempt
@require_http_methods(["PUT"])
def api_actualizar_novedad(request, pk):
    """Actualiza una novedad existente"""
    novedad = get_object_or_404(Novedad, pk=pk)
    
    try:
        data = json.loads(request.body)
        
        # Validar formulario
        form = NovedadForm(data, instance=novedad)
        
        if not form.is_valid():
            return JsonResponse({
                'success': False,
                'message': 'Error de validación',
                'errors': {field: [str(e) for e in errors] 
                          for field, errors in form.errors.items()}
            }, status=400)
        
        # Guardar cambios
        novedad = form.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Novedad actualizada exitosamente',
            'novedad': serializar_novedad(novedad)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Error al parsear los datos JSON'
        }, status=400)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al actualizar la novedad: {str(e)}'
        }, status=500)


# =============================================================================
# API - ELIMINAR NOVEDAD
# =============================================================================

@csrf_exempt
@require_http_methods(["DELETE"])
def api_eliminar_novedad(request, pk):
    """Elimina una novedad"""
    novedad = get_object_or_404(Novedad, pk=pk)
    
    try:
        titulo = novedad.titulo
        novedad.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Novedad "{titulo}" eliminada exitosamente'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al eliminar la novedad: {str(e)}'
        }, status=400)


# =============================================================================
# API - NOVEDAD DETALLE (PUT/DELETE)
# =============================================================================

@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def api_novedad_detalle(request, pk):
    """Maneja actualización y eliminación de novedades"""
    if request.method == "PUT":
        return api_actualizar_novedad(request, pk)
    elif request.method == "DELETE":
        return api_eliminar_novedad(request, pk)


# =============================================================================
# API - LISTAR FICHAS
# =============================================================================

@require_http_methods(["GET"])
def api_listar_fichas(request):
    """Obtiene lista de fichas activas"""
    try:
        fichas = Ficha.objects.select_related('id_programa').filter(
            estado__in=['Activo', 'Activa']
        ).order_by('numeroficha')
        
        fichas_data = [{
            'id': f.id_ficha,
            'numero': f.numeroficha or f.numero_ficha or '',
            'programa': f.id_programa.nombre_programa if f.id_programa else ''
        } for f in fichas]
        
        return JsonResponse({
            'success': True,
            'message': 'Fichas obtenidas exitosamente',
            'fichas': fichas_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al obtener fichas: {str(e)}'
        }, status=500)


# =============================================================================
# API - LISTAR INSTRUCTORES
# =============================================================================

@require_http_methods(["GET"])
def api_listar_instructores(request):
    """Obtiene lista de instructores activos"""
    try:
        instructores = Usuarios.objects.filter(
            estado='Activo'
        ).order_by('nombre', 'apellido')
        
        instructores_data = [{
            'id': u.id_usuario,
            'nombre': f"{u.nombre} {u.apellido}",
            'cedula': u.cedula or ''
        } for u in instructores]
        
        return JsonResponse({
            'success': True,
            'message': 'Instructores obtenidos exitosamente',
            'instructores': instructores_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al obtener instructores: {str(e)}'
        }, status=500)



