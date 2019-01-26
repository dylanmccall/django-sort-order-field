================
Sort Order Field
================

Sort Order Field provides a Django model field for controlling sort order.
The field provides an admin widget which makes it easy to arrange related
models in an inline form.

This is a very naive sort field, with no awareness of the model's ordering
property and very specific admin support. However, it provides a simple and
accessible user interface which could be useful for certain situations.

.. figure:: https://raw.githubusercontent.com/dylanmccall/django-sort-order-field/1.0/docs/images/sort-buttons.gif
   :alt: screencast showing sort buttons in action

   Easy to use sort buttons.

.. figure:: https://raw.githubusercontent.com/dylanmccall/django-sort-order-field/1.0/docs/images/keyboard-navigation.gif
   :alt: screencast showing sort buttons in action

   Accessible keyboard navigation and non-sequential sort indexes.

  

Installation
------------

Add "sort_order_field" to your INSTALLED_APPS setting::

    INSTALLED_APPS = [
        ...
        'sort_order_field',
    ]

Basic usage
-----------

Add a SortOrderField to one of your models::

    from django.db import models
    from sort_order_field import SortOrderField

    class Poll(models.Model):
        question = models.CharField(max_length=100)

    class PollOption(models.Model):
        class Meta:
            ordering = ('sort_order',)

        poll = models.ForeignKey('Poll', on_delete=models.CASCADE)
        sort_order = SortOrderField(_("Sort"))
        label = models.CharField(max_length=100)

Add the sortable model to an inline model admin for your parent model::

    from django.contrib import admin
    from . import models

    class PollOptionInline(admin.TabularInline):
        model = models.PollOption
        fields = ('sort_order', 'label',)

    @admin.register(models.Poll)
    class PollAdmin(admin.ModelAdmin):
        fields = ('question',)
        inlines = (PollOptionInline,)

The sort order field will be rendered as a text field with JavaScript
enhancements. When the user enters a new sort order, the inline forms will be
reorganized according to that change. The sort order fields will also be bound
by their initial values, in order to avoid conflicts if the same objects
appear in different inlines.
