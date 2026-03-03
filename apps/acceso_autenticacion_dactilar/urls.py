from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='acceso_index'),
]
