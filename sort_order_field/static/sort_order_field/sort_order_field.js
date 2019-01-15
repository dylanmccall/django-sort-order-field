django.jQuery(function($) {
    var SORT_DIRECTION_UP = -1;
    var SORT_DIRECTION_DOWN = 1;

    function SortableFormset(formsetElem) {
        var sortableFormset = this;

        var getAllRows = function() {
            return $(sortableFormset.rowSelector).not('.empty-form');
        };

        this.updateRows = function() {
            var $allRows = getAllRows();
            updateSortOrderValuesByPosition($allRows);
        };

        this.getRowIdForInputElem = function(inputElem) {
            var $inputElem = $(inputElem);
            var $allRows = getAllRows();
            var $widgetRow = $inputElem.closest($allRows);
            return $widgetRow.attr('id');
        };

        this.updateSortOrderOnRow = function(rowId, direction) {
            var $allRows = getAllRows();
            var $rowElem = $allRows.filter('#'+rowId);
            var $targetInput = $('.sort-order-input', $rowElem);
            var targetSort = Number($targetInput.val());

            if (direction !== undefined) {
                targetSort += direction;
                $targetInput.val(targetSort);
            }

            var $placeholder = $('<div>')
                .css('display', 'none')
                .insertBefore($allRows.first());

            sortRowsAroundTarget($allRows, rowId, targetSort);
            updateSortOrderValuesByPosition($allRows);

            $allRows.detach().insertAfter($placeholder);
            $placeholder.remove();

            $targetInput.focus();
        };

        var sortRowsAroundTarget = function($allRows, targetRowId, targetSort) {
            var firstRowWithValue = getFirstRowWithValue($allRows, targetSort);

            var changeDirection = (firstRowWithValue === targetRowId) ? 1 : -1;

            $allRows.sort(function(rowA, rowB) {
                var idA = $(rowA).attr('id');
                var idB = $(rowB).attr('id');
                var valA = Number($('.sort-order-input', rowA).val());
                var valB = Number($('.sort-order-input', rowB).val());
                if (valA < valB) {
                    return -1;
                } else if (valA > valB) {
                    return 1;
                } else if (idA === targetRowId) {
                    return changeDirection
                } else if (idB === targetRowId) {
                    return -changeDirection;
                } else {
                    return 0;
                }
            });
        };

        var updateSortOrderValuesByPosition = function($allRows) {
            $.each($allRows, function(index, row) {
                var $row = $(row);
                var $input = $('.sort-order-input', row);
                $input.val(index + 1);
                if (index % 2 == 0) {
                    $row.addClass('row1');
                    $row.removeClass('row2');
                } else {
                    $row.removeClass('row1');
                    $row.addClass('row2');
                }
            });
        };

        var getFirstRowWithValue = function($allRows, searchSortValue) {
            return $allRows
                .filter(function(index, row) {
                    var $input = $('.sort-order-input', row);
                    var rowSortValue = Number($input.val());
                    return rowSortValue === searchSortValue;
                })
                .map(function(index, row) {
                    return $(row).attr('id');
                })
                .first()[0];
        };

        var getFormsetOptions = function(formsetData) {
            if (formsetData && formsetData.options) {
                return formsetData.options;
            } else {
                return {};
            }
        };

        var init = function() {
            sortableFormset.$formsetElem = $(formsetElem);

            var formsetData = sortableFormset.$formsetElem.data('inline-formset');
            var options = getFormsetOptions(formsetData);
            sortableFormset.prefix = options.prefix;
            sortableFormset.rowSelector = '.dynamic-'+sortableFormset.prefix, sortableFormset.$formsetElem;

            sortableFormset.updateRows();
        };
        init();
    }

    var getSortableFormsetForFormsetElem = function(formsetElem) {
        var $formsetElem = $(formsetElem);
        var sortableFormset = $formsetElem.data('sort-order-field--sortable-formset');
        if (!sortableFormset) {
            sortableFormset = new SortableFormset($formsetElem);
            $formsetElem.data('sort-order-field--sortable-formset', sortableFormset);
        }
        return sortableFormset;
    }

    var getSortableFormsetForInputElem = function(inputElem) {
        var $inputElem = $(inputElem);
        var $formsetElem = $inputElem.closest('.js-inline-admin-formset');
        return getSortableFormsetForFormsetElem($formsetElem);
    };

    var getSortableFormsetByName = function(formsetName) {
        var $formsetElem = $('#'+formsetName+'-group');
        return getSortableFormsetForFormsetElem($formsetElem);
    };

    $(document).on('change', '.sort-order-input', function(event) {
        event.preventDefault();
        var formset = getSortableFormsetForInputElem(this);
        if (formset) {
            var rowId = formset.getRowIdForInputElem(this);
            formset.updateSortOrderOnRow(rowId);
        }
    });

    $(document).on('click', '.sort-order-input--move-up', function(event) {
        event.preventDefault();
        var formset = getSortableFormsetForInputElem(this);
        if (formset) {
            var rowId = formset.getRowIdForInputElem(this);
            formset.updateSortOrderOnRow(rowId, SORT_DIRECTION_UP);
        }
    });

    $(document).on('click', '.sort-order-input--move-down', function(event) {
        event.preventDefault();
        var formset = getSortableFormsetForInputElem(this);
        if (formset) {
            var rowId = formset.getRowIdForInputElem(this);
            formset.updateSortOrderOnRow(rowId, SORT_DIRECTION_DOWN);
        }
    });

    $(document).on('formset:added', function(event, $row, formsetName) {
        var formset = getSortableFormsetByName(formsetName);
        formset.updateRows();
    });

    $(document).on('formset:removed', function(event, $row, formsetName) {
        var formset = getSortableFormsetByName(formsetName);
        formset.updateRows();
    });

    $('.sort-order-input').each(function(index, inputElem) {
        var $inputElem = $(inputElem);

        var sortableFormset = getSortableFormsetForInputElem($inputElem);
        void(sortableFormset);

        var upLabel = $inputElem.data('label-up');
        var downLabel = $inputElem.data('label-down');
        var $upButton = $('<a>')
            .attr('href', '')
            .attr('title', upLabel)
            .addClass('sort-order-input--move-up')
            .html('&#9650;')
        var $downButton = $('<a>')
            .attr('href', '')
            .attr('title', downLabel)
            .addClass('sort-order-input--move-down')
            .html('&#9660;')
        var $buttonsBox = $('<span>')
            .addClass('sort-order-input--buttons')
            .append($upButton, $downButton);
        $buttonsBox.insertAfter($inputElem);
    });
});
