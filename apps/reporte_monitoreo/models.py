from django.db import models

# =========================================================================
# 1. TABLAS MAESTRAS (No dependen de otras en este archivo)
# =========================================================================

class Coordinacion(models.Model):
    id_coordinacion = models.AutoField(primary_key=True)
    nombre_coordinacion = models.CharField(max_length=255, blank=True, null=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    nombrecoordinacion = models.CharField(db_column='nombreCoordinacion', max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'coordinacion'

class Jornada(models.Model):
    id_jornada = models.AutoField(primary_key=True)
    nombre_jornada = models.CharField(max_length=50, blank=True, null=True)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    class Meta:
        managed = False
        db_table = 'jornada'

# =========================================================================
# 2. TABLAS SECUNDARIAS (Dependen de las tablas maestras)
# =========================================================================

class Programa(models.Model):
    id_programa = models.AutoField(primary_key=True)
    nombre_programa = models.CharField(max_length=255, blank=True, null=True)
    tipo_programa = models.CharField(max_length=255, blank=True, null=True)
    id_coordinacion = models.ForeignKey(Coordinacion, models.DO_NOTHING, db_column='id_coordinacion')

    class Meta:
        managed = False
        db_table = 'programa'

class Competencia(models.Model):
    id_competencia = models.AutoField(primary_key=True)
    nombre_competencia = models.CharField(max_length=255, blank=True, null=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    id_programa = models.ForeignKey(Programa, models.DO_NOTHING, db_column='id_programa')
    estado = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'competencia'

class Ficha(models.Model):
    id_ficha = models.AutoField(primary_key=True)
    numeroficha = models.CharField(max_length=255, blank=True, null=True)
    fecha = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=255, blank=True, null=True)
    id_programa = models.ForeignKey(Programa, models.DO_NOTHING, db_column='id_programa')
    id_jornada = models.ForeignKey(Jornada, models.DO_NOTHING, db_column='id_jornada')
    numero_ficha = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ficha'

class Usuarios(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    cedula = models.CharField(max_length=255, blank=True, null=True)
    correo = models.CharField(max_length=255, blank=True, null=True)
    email_verified_at = models.DateTimeField(blank=True, null=True)
    nombre = models.CharField(max_length=255, blank=True, null=True)
    apellido = models.CharField(max_length=255, blank=True, null=True)
    id_ficha = models.ForeignKey(Ficha, models.DO_NOTHING, db_column='id_ficha', blank=True, null=True)
    telefono = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=255, blank=True, null=True)
    password = models.CharField(max_length=255)
    foto_perfil = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuarios'

# =========================================================================
# 3. TABLAS OPERACIONALES (Tu módulo principal)
# =========================================================================

class AsistenciaAmbiente(models.Model):
    id_asistencia_ambiente = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_usuario')
    id_instructor = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_instructor', related_name='asistenciaambiente_id_instructor_set', blank=True, null=True)
    id_competencia = models.ForeignKey(Competencia, models.DO_NOTHING, db_column='id_competencia', blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)
    estado_asistencia = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'asistencia_ambiente'

class AsistenciaSede(models.Model):
    id_asistencia = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_usuario')
    fecha = models.DateField(blank=True, null=True)
    hora_entrada = models.TimeField(blank=True, null=True)
    hora_salida = models.TimeField(blank=True, null=True)
    estado_asistencia = models.CharField(max_length=255, blank=True, null=True)
    id_instructor = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'asistencia_sede'

class Notification(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(blank=True, null=True)
    link = models.CharField(max_length=255, blank=True, null=True)
    mensaje = models.TextField(blank=True, null=True)
    novedad_id = models.IntegerField(blank=True, null=True)
    read_flag = models.TextField(blank=True, null=True) 
    titulo = models.CharField(max_length=255, blank=True, null=True)
    usuario = models.ForeignKey(Usuarios, models.DO_NOTHING, blank=True, null=True)
    createdat = models.DateTimeField(db_column='createdAt', blank=True, null=True) 
    novedadid = models.IntegerField(db_column='novedadId', blank=True, null=True) 
    readflag = models.TextField(db_column='readFlag', blank=True, null=True) 

    class Meta:
        managed = False
        db_table = 'notification'

class Novedad(models.Model):
    id_novedad = models.AutoField(primary_key=True)
    id_coordinador = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_coordinador')
    id_instructor = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_instructor', related_name='novedad_id_instructor_set')
    titulo = models.CharField(max_length=255, blank=True, null=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)
    respuesta = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=255, blank=True, null=True)
    id_ficha = models.ForeignKey(Ficha, models.DO_NOTHING, db_column='id_ficha', blank=True, null=True)
    archivo_adjunto = models.CharField(max_length=255, blank=True, null=True)
    respuesta_instructor = models.CharField(max_length=255, blank=True, null=True)
    tipo = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'novedad'

class FichaInstructor(models.Model):
    id_ficha = models.OneToOneField(Ficha, models.DO_NOTHING, db_column='id_ficha', primary_key=True) 
    id_instructor = models.ForeignKey(Usuarios, models.DO_NOTHING, db_column='id_instructor')

    class Meta:
        managed = False
        db_table = 'ficha_instructor'
        unique_together = (('id_ficha', 'id_instructor'),)

class Justificacion(models.Model):
    id_justificacion = models.BigAutoField(primary_key=True)
    id_asistencia_ambiente = models.IntegerField(blank=True, null=True)
    motivo = models.CharField(max_length=255, blank=True, null=True)
    soporte = models.CharField(max_length=255, blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=255, blank=True, null=True)
    observaciones = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'justificacion'
        