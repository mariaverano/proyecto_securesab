from django.urls import path
from . import views

app_name = 'vigilante'

urlpatterns = [
    path('', views.vigilante_index, name='index'),
    path('consultar-invitados/', views.consultar_invitados, name='consultar_invitados'),
    path('historial-registro/', views.historial_registro, name='historial_registro'),
    path('registrar-invitados/', views.registrar_invitados, name='registrar_invitados'),
    path('registrar-manual/', views.registrar_manual, name='registrar_manual'),
    path('registro-manual/', views.registrar_manual, name='registro_manual'),  # Alias
    path('salida-invitado/<int:invitado_id>/', views.salida_invitado, name='salida_invitado'),
    path('perfil/', views.perfil, name='perfil'),
    path('actualizar-foto-perfil/', views.actualizar_foto_perfil, name='actualizar_foto_perfil'),
]
