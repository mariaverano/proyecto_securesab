from django import forms
from .models import Novedad, Ficha, Usuarios


class NovedadForm(forms.ModelForm):
    """
    Formulario para crear y editar novedades.
    Utiliza ModelForm de Django para validación automática.
    """
    
    # Campos personalizados para mejor control
    id_ficha = forms.ModelChoiceField(
        queryset=Ficha.objects.filter(estado__in=['Activo', 'Activa']).order_by('numeroficha'),
        required=False,
        empty_label="Seleccionar ficha...",
        label="Ficha",
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'id_ficha'
        })
    )
    
    id_instructor = forms.ModelChoiceField(
        queryset=Usuarios.objects.filter(estado='Activo').order_by('nombre', 'apellido'),
        required=True,
        empty_label="Seleccionar instructor...",
        label="Instructor",
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'id_instructor'
        })
    )
    
    titulo = forms.CharField(
        max_length=255,
        required=True,
        label="Título",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Título de la novedad',
            'id': 'titulo'
        })
    )
    
    descripcion = forms.CharField(
        required=True,
        label="Descripción",
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Descripción detallada de la novedad...',
            'rows': 4,
            'id': 'descripcion'
        })
    )
    
    tipo = forms.ChoiceField(
        choices=[
            ('', 'Seleccionar tipo...'),
            ('Urgente', 'Urgente'),
            ('Incidencia', 'Incidencia'),
            ('Aviso', 'Aviso'),
        ],
        required=True,
        label="Tipo",
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'tipo'
        })
    )
    
    estado = forms.ChoiceField(
        choices=[
            ('Pendiente', 'Pendiente'),
            ('En proceso', 'En proceso'),
            ('Resuelto', 'Resuelto'),
        ],
        required=True,
        initial='Pendiente',
        label="Estado",
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'estado'
        })
    )
    
    respuesta = forms.CharField(
        required=False,
        label="Respuesta",
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Respuesta o seguimiento de la novedad (opcional)...',
            'rows': 3,
            'id': 'respuesta'
        })
    )
    
    fecha = forms.DateField(
        required=False,
        label="Fecha",
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date',
            'id': 'fecha'
        })
    )
    
    class Meta:
        model = Novedad
        fields = [
            'id_ficha',
            'id_instructor',
            'titulo',
            'descripcion',
            'tipo',
            'estado',
            'respuesta',
            'fecha',
            'archivo_adjunto',
            'respuesta_instructor'
        ]
        exclude = ['id_coordinador']  # Se asigna en la vista
    
    def __init__(self, *args, **kwargs):
        """Personalización adicionalal inicializar el formulario"""
        super().__init__(*args, **kwargs)
        
        # Hacer que algunos campos sean opcionales
        self.fields['archivo_adjunto'].required = False
        self.fields['respuesta_instructor'].required = False
        self.fields['fecha'].required = False
        
        # Personalizar labels
        self.fields['archivo_adjunto'].label = "Archivo Adjunto"
        self.fields['respuesta_instructor'].label = "Respuesta del Instructor"
    
    def clean_titulo(self):
        """Validación personalizada para el título"""
        titulo = self.cleaned_data.get('titulo')
        if titulo and len(titulo) < 3:
            raise forms.ValidationError('El título debe tener al menos 3 caracteres.')
        return titulo
    
    def clean_descripcion(self):
        """Validación personalizada para la descripción"""
        descripcion = self.cleaned_data.get('descripcion')
        if descripcion and len(descripcion) < 10:
            raise forms.ValidationError('La descripción debe tener al menos 10 caracteres.')
        return descripcion


class NovedadFilterForm(forms.Form):
    """Formulario para filtrar novedades"""
    
    search = forms.CharField(
        required=False,
        label="Buscar",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Buscar por título, ficha o instructor...'
        })
    )
    
    estado = forms.ChoiceField(
        choices=[
            ('', 'Todos los Estados'),
            ('Pendiente', 'Pendiente'),
            ('En proceso', 'En proceso'),
            ('Resuelto', 'Resuelto'),
        ],
        required=False,
        label="Estado",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    tipo = forms.ChoiceField(
        choices=[
            ('', 'Todos los Tipos'),
            ('Urgente', 'Urgente'),
            ('Incidencia', 'Incidencia'),
            ('Aviso', 'Aviso'),
        ],
        required=False,
        label="Tipo",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
