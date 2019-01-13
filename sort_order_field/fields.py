from django import forms
from django.contrib.admin import widgets as admin_widgets
from django.db import models

from .admin_widgets import SortOrderInput

class SortOrderField(models.PositiveIntegerField):
    description = "A value for sorting model instances"

    def __init__(self, *args, default=0, db_index=True, **kwargs):
        self.widget = SortOrderInput()
        super().__init__(*args, default=default, db_index=db_index, **kwargs)

    def formfield(self, **kwargs):
        defaults = {'widget': self.widget}
        defaults.update(kwargs)

        if defaults['widget'] == admin_widgets.AdminIntegerFieldWidget:
            defaults['widget'] = self.widget
        return super().formfield(**defaults)
