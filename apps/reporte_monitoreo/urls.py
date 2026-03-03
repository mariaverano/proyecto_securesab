from django.urls import path
from . import views

app_name = 'reporte_monitoreo'

urlpatterns = [
    # Landing page principal
    path('', views.landing, name='landing'),
    
    # Autenticación
    path('login/', views.login_view, name='login'),
    
    # Dashboard y vistas de coordinación
    path('inicio/', views.inicio, name='inicio_alt'),
    path('coordinacion/', views.inicio, name='inicio'),
    path('coordinacion/index/', views.index, name='index'),
    path('coordinacion/asistencia-ambiente/', views.asistencia_ambiente, name='asistencia_ambiente'),
    path('coordinacion/asistencia-sede/', views.asistencia_sede, name='asistencia_sede'),
    path('coordinacion/crear-novedad/', views.crear_novedad, name='crear_novedad'),
    path('coordinacion/justificaciones/', views.justificaciones, name='justificaciones'),
    path('coordinacion/mi-perfil/', views.mi_perfil, name='mi_perfil'),
    
    # Rutas alternativas (sin prefijo coordinacion/)
    path('index/', views.index, name='index_alt'),
    path('asistencia-ambiente/', views.asistencia_ambiente, name='asistencia_ambiente_alt'),
    path('asistencia-sede/', views.asistencia_sede, name='asistencia_sede_alt'),
    path('crear-novedad/', views.crear_novedad, name='crear_novedad_alt'),
    path('justificaciones/', views.justificaciones, name='justificaciones_alt'),
    path('mi-perfil/', views.mi_perfil, name='mi_perfil_alt'),
]
