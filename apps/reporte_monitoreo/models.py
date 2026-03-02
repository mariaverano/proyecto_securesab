from django.db import models

# Create your models here.
class usuario(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    contraseña = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre