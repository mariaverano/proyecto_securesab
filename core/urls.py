"""
URL configuration for SecureSab project.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Módulo 1: Reporte y Monitoreo
    path('', include('apps.reporte_monitoreo.urls')),

    # Módulo 2: Acceso y Autenticación Dactilar
    path('acceso/', include('apps.acceso_autenticacion_dactilar.urls')),
    
    # Módulo 2B: Vigilante (con namespace vigilante)
    path('vigilante/', include('apps.acceso_autenticacion_dactilar.urls_vigilante')),

    # Módulo 3: Gestión de Asistencia y Justificación
    path('asistencia/', include('apps.gestion_asistencia_justificacion.urls')),

    # Módulo 4: Seguridad y Administración
    path('seguridad/', include('apps.seguridad_administracion.urls')),
]

