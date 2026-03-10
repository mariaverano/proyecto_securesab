from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from datetime import datetime
import json
from .models import Novedad, Usuarios, Ficha

# Create your views here.

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
# API NOVEDADES
# =============================================================================

@csrf_exempt
@require_http_methods(["GET"])
def api_listar_novedades(request):
    """Lista todas las novedades con filtros opcionales"""
    try:
        # Obtener parámetros de filtro
        search = request.GET.get('search', '')
        estado = request.GET.get('estado', '')
        tipo = request.GET.get('tipo', '')
        
        # Consultar novedades
        novedades = Novedad.objects.select_related(
            'id_coordinador', 'id_instructor', 'id_ficha'
        ).all().order_by('-fecha', '-id_novedad')
        
        # Aplicar filtros
        if search:
            from django.db.models import Q
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
        
        # Serializar datos
        novedades_data = []
        for novedad in novedades:
            novedades_data.append({
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
            })
        
        # Obtener estadísticas
        stats = {
            'total': Novedad.objects.count(),
            'pendientes': Novedad.objects.filter(estado='Pendiente').count(),
            'enProceso': Novedad.objects.filter(estado='En proceso').count(),
            'resueltas': Novedad.objects.filter(estado='Resuelto').count(),
        }
        
        return JsonResponse({
            'success': True,
            'novedades': novedades_data,
            'stats': stats
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al obtener novedades: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_crear_novedad(request):
    """Crea una nueva novedad"""
    try:
        # Parsear datos JSON
        data = json.loads(request.body)
        
        # Validar campos requeridos
        if not data.get('id_instructor'):
            return JsonResponse({
                'success': False,
                'message': 'El instructor es requerido'
            }, status=400)
        
        # TODO: Obtener el coordinador del usuario actual de la sesión
        # Por ahora usaremos el primer coordinador disponible
        coordinador = Usuarios.objects.first()
        
        # Obtener instructor
        instructor = get_object_or_404(Usuarios, pk=data.get('id_instructor'))
        
        # Obtener ficha (opcional)
        ficha = None
        if data.get('id_ficha'):
            ficha = get_object_or_404(Ficha, pk=data.get('id_ficha'))
        
        # Crear novedad
        novedad = Novedad.objects.create(
            id_coordinador=coordinador,
            id_instructor=instructor,
            id_ficha=ficha,
            titulo=data.get('titulo', ''),
            descripcion=data.get('descripcion', ''),
            tipo=data.get('tipo', 'Aviso'),
            fecha=data.get('fecha') if data.get('fecha') else datetime.now().date(),
            estado=data.get('estado', 'Pendiente'),
            respuesta=data.get('respuesta', ''),
            respuesta_instructor=data.get('respuesta_instructor', ''),
            archivo_adjunto=data.get('archivo', '')
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Novedad creada exitosamente',
            'novedad': {
                'id': novedad.id_novedad,
                'titulo': novedad.titulo,
                'fecha': novedad.fecha.strftime('%Y-%m-%d') if novedad.fecha else '',
            }
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
        }, status=400)


@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def api_novedad_detalle(request, pk):
    """Actualiza o elimina una novedad específica"""
    novedad = get_object_or_404(Novedad, pk=pk)
    
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            
            # Actualizar campos
            if 'titulo' in data:
                novedad.titulo = data['titulo']
            if 'descripcion' in data:
                novedad.descripcion = data['descripcion']
            if 'tipo' in data:
                novedad.tipo = data['tipo']
            if 'estado' in data:
                novedad.estado = data['estado']
            if 'respuesta' in data:
                novedad.respuesta = data['respuesta']
            if 'respuesta_instructor' in data:
                novedad.respuesta_instructor = data['respuesta_instructor']
            if 'archivo' in data:
                novedad.archivo_adjunto = data['archivo']
            
            # Actualizar relaciones si se proporcionan
            if 'id_instructor' in data:
                instructor = get_object_or_404(Usuarios, pk=data['id_instructor'])
                novedad.id_instructor = instructor
            
            if 'id_ficha' in data:
                if data['id_ficha']:
                    ficha = get_object_or_404(Ficha, pk=data['id_ficha'])
                    novedad.id_ficha = ficha
                else:
                    novedad.id_ficha = None
            
            novedad.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Novedad actualizada exitosamente'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al actualizar la novedad: {str(e)}'
            }, status=400)
    
    elif request.method == "DELETE":
        try:
            novedad.delete()
            return JsonResponse({
                'success': True,
                'message': 'Novedad eliminada exitosamente'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al eliminar la novedad: {str(e)}'
            }, status=400)


@require_http_methods(["GET"])
def api_listar_fichas(request):
    """Obtiene lista de fichas para selectores"""
    try:
        fichas = Ficha.objects.select_related('id_programa').filter(
            estado='Activo'
        ).order_by('numeroficha')
        
        fichas_data = [{
            'id': f.id_ficha,
            'numero': f.numeroficha or '',
            'programa': f.id_programa.nombre_programa if f.id_programa else ''
        } for f in fichas]
        
        return JsonResponse({'success': True, 'fichas': fichas_data})
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al obtener fichas: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
def api_listar_instructores(request):
    """Obtiene lista de instructores para selectores"""
    try:
        # Obtener usuarios que son instructores (ajustar según tu lógica de roles)
        instructores = Usuarios.objects.filter(
            estado='Activo'
        ).order_by('nombre', 'apellido')
        
        instructores_data = [{
            'id': u.id_usuario,
            'nombre': f"{u.nombre} {u.apellido}",
            'cedula': u.cedula or ''
        } for u in instructores]
        
        return JsonResponse({'success': True, 'instructores': instructores_data})
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al obtener instructores: {str(e)}'
        }, status=500)



