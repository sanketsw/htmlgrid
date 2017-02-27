(function($) {

    /* Create table function */

    var App = function() {};

    App.prototype.callables = { //Return closure
        tableCreate: function(id, obj) {
            tableCreate(id, obj)
        }
    }

    $.fn.htmlgrid = function() {
        return new App().callables; //basically send back an instance of your plugin class with the closure
    }

    function tableCreate(id, obj) {
        var div = document.getElementById(id);
        var tbl = document.createElement('table');
        // tbl.style.width = '100px';
        tbl.style.border = '1px solid black';

        var noOfColumns = obj.columns.length;

        for (var i = 0; i < obj.data.length; i++) {
            var tr = tbl.insertRow();
            for (var j = 0; j < noOfColumns; j++) {
                var column = obj.columns[j];
                var td = tr.insertCell();
                td.appendChild(document.createTextNode('Cell'));
                td.style.border = '1px solid black';
                if (column.editable == false) {
                    td.className += "readOnlyCell";
                } else {
                    td.setAttribute('tabindex', '0');
                }
                td.innerHTML = (obj.data[i][obj.columns[j].field]);
            }
        }

        var header = tbl.createTHead();
        var headerRow = header.insertRow();
        var tr = tbl.tHead.children[0];
        for (var j = 0; j < noOfColumns; j++) {
            var th = document.createElement('th');;
            var text = "<th>" + obj.columns[j].title;
            if (obj.columns[j].filter && obj.columns[j].filter.type == "text") {
                text += '<br/><input type="text" class="filter" placeholder="Filter by text">';
            }
            text += "</th>"
            th.innerHTML = text;
            tr.appendChild(th);
            alert(th.outerHTML)
        }
        div.appendChild(tbl);
    }

    /* Sort Function */
    $(function() {
        //grab all header rows
        $('th').each(function(column) {
            $(this).addClass('sortable').click(function() {
                var findSortKey = function($cell) {
                    return $cell.find('.sort-key').text().toUpperCase() + ' ' + $cell.text().toUpperCase();

                };
                var sortDirection = $(this).is('.sorted-asc') ? -1 : 1;
                var $rows = $(this).parent().parent().parent().find('tbody tr').get();
                var bob = 0;
                //loop through all the rows and find
                $.each($rows, function(index, row) {
                    row.sortKey = findSortKey($(row).children('td').eq(column));
                });

                //compare and sort the rows alphabetically or numerically
                $rows.sort(function(a, b) {
                    if (a.sortKey.indexOf('-') == -1 && (!isNaN(a.sortKey) && !isNaN(a.sortKey))) {
                        //Rough Numeracy check

                        if (parseInt(a.sortKey) < parseInt(b.sortKey)) {
                            return -sortDirection;
                        }
                        if (parseInt(a.sortKey) > parseInt(b.sortKey)) {
                            return sortDirection;
                        }

                    } else {
                        if (a.sortKey < b.sortKey) {
                            return -sortDirection;
                        }
                        if (a.sortKey > b.sortKey) {
                            return sortDirection;
                        }
                    }
                    return 0;
                });

                //add the rows in the correct order to the bottom of the table
                $.each($rows, function(index, row) {
                    $('tbody').append(row);
                    row.sortKey = null;
                });

                //identify the collumn sort order
                $('th').removeClass('sorted-asc sorted-desc');
                var $sortHead = $('th').filter(':nth-child(' + (column + 1) + ')');
                sortDirection == 1 ? $sortHead.addClass('sorted-asc') : $sortHead.addClass('sorted-desc');

                //identify the collum to be sorted by
                $('td').removeClass('sorted').filter(':nth-child(' + (column + 1) + ')').addClass('sorted');
            });
        });


        /* Select Deselect Function */

        var selectedRows = [];
        var selectedCell;

        function deselectAll(row) {
            $(row).parent().find('tr').removeClass("highlighted");
            selectedRows = [];
        }

        function selectRow(row) {
            selectedRows[row] = row;
            $(row).addClass("highlighted");
        }

        function selectCell(cell, deselectAllFlag) {
            // console.log(selectedCell);
            // console.log(cell);
            if (selectedCell != cell) {
                if (deselectAllFlag == 'deselectAll') {
                    deselectAll($(cell).parent());
                }
                $(selectedCell).removeClass("selectedCell");
                $(selectedCell).find(">:first-child").blur();

                $(cell).addClass("selectedCell");
                selectedCell = cell;
                setTimeout(function() {
                    $(cell).focus();
                }, 100);
                selectRow($(cell).parent());
            }
        }

        var isMouseDown = false;

        $("td")
            .mousedown(function() {
                isMouseDown = true;
                selectCell(this, 'deselectAll');
                return false; // prevent text selection
            })
            .mouseover(function() {
                if (isMouseDown) {
                    // console.log($(this).html());
                    selectRow($(this).parent());
                }
            })
            .bind("selectstart", function() {
                return false; // prevent text selection in IE
            });

        $(document)
            .mouseup(function() {
                isMouseDown = false;
            });

        /* Inline Edit function */

        var editMode = false;

        function moveToNextCell(cell, shiftKey, direction, edit) {
            var nextCell = null;
            // console.log(shiftKey);
            // console.log(direction);
            if ((shiftKey && direction == 9) || direction == 37) {
                // Shift Tab event.shiftKey &&  event.keyCode == 9
                // Left arrow 37
                var nextCell = $(cell).prev();
                while (nextCell.html() != null && nextCell.hasClass("readOnlyCell")) {
                    nextCell = $(nextCell).prev();
                }
                if (nextCell.html() == null) {
                    nextCell = $(cell).parent().prev().find(">:last-child");
                    while (nextCell.hasClass("readOnlyCell")) {
                        nextCell = $(nextCell).prev();
                    }
                }
            } else if (direction == 13 || direction == 9 || direction == 39) {
                // Enter 13 Tab 9 Right Arrow 39
                var nextCell = $(cell).next();
                while (nextCell.html() != null && nextCell.hasClass("readOnlyCell")) {
                    nextCell = $(nextCell).next();
                }
                if (nextCell.html() == null) {
                    nextCell = $(cell).parent().next().find(">:first-child");
                    while (nextCell.hasClass("readOnlyCell")) {
                        nextCell = $(nextCell).next();
                    }
                }
            } else if (direction == 38) {
                // Up arrow 38
                var cellIndex = $(cell).prevAll().length + 1;
                nextCell = $(cell).parent().prev().find(">:nth-child(" + cellIndex + ")");
            } else if (direction == 40) {
                // Down Arrow 40
                var cellIndex = $(cell).prevAll().length + 1;
                nextCell = $(cell).parent().next().find(">:nth-child(" + cellIndex + ")");
            }
            if (nextCell != null) {
                selectCell(nextCell, 'deselectAll');
                if (edit) editCell(nextCell);
            }
        }

        function editCell(cell, firstKey) {
            if ($(cell).hasClass("readOnlyCell") || $(cell).hasClass("cellEditing")) return;
            if (!editMode) editMode = true;
            var OriginalContent = $(cell).text();
            $(cell).addClass("cellEditing");
            var val = OriginalContent;
            if (firstKey) {
                val = String.fromCharCode(firstKey);
            }
            $(cell).html('<input type="text" value=' + val + ' />');
            setTimeout(function() {
                $(cell).find(">:first-child").focus().val(val);;
            }, 100);

            $(cell).find(">:first-child").keydown(function(e) {
                var keyCode = e.keyCode || e.which;
                if (keyCode == 13 || keyCode == 38 || keyCode == 40 || keyCode == 9 || keyCode == 37 || keyCode == 39) {
                    // navigation keys
                    var newContent = $(this).val();
                    $(cell).text(newContent);
                    $(cell).removeClass("cellEditing");
                    moveToNextCell(cell, e.shiftKey, keyCode, true);
                } else if (keyCode == 27) {
                    //escape
                    $(cell).text(OriginalContent);
                    $(cell).removeClass("cellEditing");
                    setTimeout(function() {
                        $(cell).focus();
                    }, 100);
                    editMode = false;
                }
            });

            // lose focus
            $(cell).find(">:first-child").blur(function() {
                // console.log('blur')
                var newContent = $(this).val();
                $(cell).text(newContent);
                $(cell).removeClass("cellEditing");
                editMode = false;
            });
        }


        $("td").dblclick(function() {
            editCell(this, null);
        });



        $("td").keydown(function(e) {
            if (!editMode) {
                var keyCode = e.keyCode || e.which;
                if (e.shiftKey || keyCode == 27 || keyCode == 38 || keyCode == 40 || keyCode == 9 || keyCode == 37 || keyCode == 39) {
                    moveToNextCell(this, e.shiftKey, keyCode, false)
                } else {
                    keyCode = keyCode == 13 ? null : keyCode;
                    // console.log(keyCode);
                    editCell(this, keyCode);
                }
            }
        });


        /* FILTER FUNCTION */
        // Refernce http://bootsnipp.com/snippets/featured/panel-table-with-filters-per-column


        $('.filter').keyup(function() {
            filter(this);
        });


        function filter(input) {
            var $input = $(input),
                $table = $input.parents('table'),
                $rows = $table.find('tbody tr');
            var column = $table.find('th').index($input.parents('th'));
            inputContent = $input.val().toLowerCase();
            var $filteredRows = $rows.filter(function() {
                var value = $(this).find('td').eq(column).text().toLowerCase();
                if (value.indexOf(inputContent) == -1) {
                    $(this).css('display', 'none');
                } else {
                    $(this).css('display', '');
                }
            });
        }

        /* CALCULATE SUMMARY function */


        // end of root
    });
})(jQuery);
