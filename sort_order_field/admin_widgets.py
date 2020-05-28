from django import forms
from django.conf import settings
from django.contrib.admin import widgets as admin_widgets
from django.utils.translation import gettext as _

HTML_INPUT_CLASS = 'sort-order-input'


class SortOrderInput(admin_widgets.AdminBigIntegerFieldWidget):
    def render(self, name, value, attrs=None, renderer=None):
        if 'class' in attrs:
            attrs['class'] = attrs['class'] + ' ' + HTML_INPUT_CLASS
        else:
            attrs['class'] = HTML_INPUT_CLASS

        attrs['data-label-up'] = _("Up")
        attrs['data-label-down'] = _("Down")

        return super().render(name, value, attrs, renderer=renderer)

    @property
    def media(self):
        extra = '' if settings.DEBUG else '.min'
        js = [
            'admin/js/vendor/jquery/jquery{0}.js'.format(extra),
            'admin/js/jquery.init.js',
            'admin/js/core.js',
            'sort_order_field/sort_order_field.js',
        ]

        css = {
            'screen': (
                'sort_order_field/sort_order_field.css',
            )
        }
        return forms.Media(css=css, js=js)
