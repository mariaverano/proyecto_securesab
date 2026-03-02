from django.urls import path
from . import views

app_name = 'reporte_monitoreo'

# Sólo las rutas específicas del módulo
urlpatterns = [
    path('login/', views.login, name='login'),
    path('inicio/', views.inicio, name='inicio'),
    path('reporte/', views.index, name='index'),
    path('asistencia-ambiente/', views.asistencia_ambiente, name='asistencia_ambiente'),
    path('asistencia-sede/', views.asistencia_sede, name='asistencia_sede'),
    path('crear-novedad/', views.crear_novedad, name='crear_novedad'),
    path('justificaciones/', views.justificaciones, name='justificaciones'),
    path('mi-perfil/', views.mi_perfil, name='mi_perfil'),
]
