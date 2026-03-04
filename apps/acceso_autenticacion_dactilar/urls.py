from django.urls import path
from . import views

app_name = 'acceso'

urlpatterns = [
    path('', views.index, name='index'),
    
    # Rutas de vigilante
    path('vigilante/', views.vigilante_index, name='vigilante_index'),
    path('vigilante/consultar-invitados/', views.consultar_invitados, name='consultar_invitados'),
    path('vigilante/historial-registro/', views.historial_registro, name='historial_registro'),
    path('vigilante/registrar-invitados/', views.registrar_invitados, name='registrar_invitados'),
    path('vigilante/registrar-manual/', views.registrar_manual, name='registrar_manual'),
    path('vigilante/registrar-manual/', views.registrar_manual, name='registro_manual'),  # Alias
    path('vigilante/salida-invitado/<int:invitado_id>/', views.salida_invitado, name='salida_invitado'),
]
