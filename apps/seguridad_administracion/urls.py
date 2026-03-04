from django.urls import path
from . import views

app_name = 'seguridad'

urlpatterns = [
    path('', views.index, name='index'),
]
