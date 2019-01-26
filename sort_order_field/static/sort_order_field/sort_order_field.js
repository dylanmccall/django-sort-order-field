django.jQuery(function($) {
    var SORT_DIRECTION_UP = -1;
    var SORT_DIRECTION_DOWN = 1;

    var UP_ARROW = 38;
    var DOWN_ARROW = 40;

    function SortableFormset(formsetElem) {
        this.$formsetElem = undefined;
        this.prefix = undefined;
        this.rowSelector = undefined;
        this.initialSortOrderByIndex = [];

        this.getAllRows = function() {
            return $(this.rowSelector).not('.empty-form');
        };

        this.updateRows = function(initial) {
            var $allRows = this.getAllRows();

            if (initial === true) {
                var lastValue = 0;
                this.initialSortOrderByIndex = $allRows.map(function(index, row) {
                    var $rowInput = $('.sort-order-input', row);
                    var rowValue = Number($rowInput.val());
                    if (rowValue <= lastValue) {
                        rowValue = lastValue + 1;
                    }
                    lastValue = rowValue;
                    return rowValue;
                }).toArray();
            }

            this.updateSortOrderValuesByPosition($allRows);
        };

        this.getRowIdForInputElem = function(inputElem) {
            var $inputElem = $(inputElem);
            var $allRows = this.getAllRows();
            var $widgetRow = $inputElem.closest($allRows);
            return $widgetRow.attr('id');
        };

        this.updateSortOrderOnRow = function(rowId, direction) {
            var $allRows = this.getAllRows();
            var $rowElem = $allRows.filter('#'+rowId);
            var $targetInput = $('.sort-order-input', $rowElem);
            var rowIndex = $allRows.index($rowElem);

            var targetSort = undefined;

            if (direction !== undefined) {
                targetSort = this.getSortOrderByIndex(rowIndex + direction);
                $targetInput.val(targetSort);
            } else {
                targetSort = Number($targetInput.val());
            }

            var $placeholder = $('<div>')
                .css('display', 'none')
                .insertBefore($allRows.first());

            this.sortRowsAroundTarget($allRows, rowId, targetSort);
            this.updateSortOrderValuesByPosition($allRows);

            $allRows.detach().insertAfter($placeholder);
            $placeholder.remove();

            $targetInput.focus();
        };

        this.sortRowsAroundTarget = function($allRows, targetRowId, targetSort) {
            var firstRowWithValue = this.getFirstRowWithValue($allRows, targetSort);

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

        this.updateSortOrderValuesByPosition = function($allRows) {
            var _this = this;
            $.each($allRows, function(index, row) {
                var $row = $(row);
                var $input = $('.sort-order-input', row);
                var sortOrder = _this.getSortOrderByIndex(index);
                $input.val(sortOrder);
                if (index % 2 == 0) {
                    $row.addClass('row1');
                    $row.removeClass('row2');
                } else {
                    $row.removeClass('row1');
                    $row.addClass('row2');
                }
            });
        };

        this.getSortOrderByIndex = function(index) {
            index = Math.max(0, index);

            var sortOrder = this.initialSortOrderByIndex[index];
            if (sortOrder === undefined) {
                var lastSortOrder = this.initialSortOrderByIndex[this.initialSortOrderByIndex.length - 1] || 0;
                var offsetFromEnd = index - this.initialSortOrderByIndex.length + 1;
                return lastSortOrder + offsetFromEnd;
            } else {
                return sortOrder;
            }
        };

        this.getFirstRowWithValue = function($allRows, searchSortValue) {
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

        this.getFormsetOptions = function(formsetData) {
            if (formsetData && formsetData.options) {
                return formsetData.options;
            } else {
                return {};
            }
        };

        this._initSortableFormset = function() {
            this.$formsetElem = $(formsetElem);

            var formsetData = this.$formsetElem.data('inline-formset');
            var options = this.getFormsetOptions(formsetData);
            this.prefix = options.prefix;
            this.rowSelector = '.dynamic-'+this.prefix, this.$formsetElem;

            this.updateRows(true);
        };
        this._initSortableFormset();
    };

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

    var sortRowForInput = function(elem, direction) {
        var formset = getSortableFormsetForInputElem(elem);
        if (formset) {
            var rowId = formset.getRowIdForInputElem(elem);
            formset.updateSortOrderOnRow(rowId, direction);
        }
    }

    $(document).on('keydown', '.sort-order-input', function(event) {
        if (event.which === UP_ARROW) {
            sortRowForInput(this, SORT_DIRECTION_UP);
            event.preventDefault();
        } else if (event.which === DOWN_ARROW) {
            sortRowForInput(this, SORT_DIRECTION_DOWN);
            event.preventDefault();
        }
    });

    $(document).on('click', '.sort-order-input--move-up', function(event) {
        sortRowForInput(this, SORT_DIRECTION_UP);
        event.preventDefault();
    });

    $(document).on('click', '.sort-order-input--move-down', function(event) {
        sortRowForInput(this, SORT_DIRECTION_DOWN);
        event.preventDefault();
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
