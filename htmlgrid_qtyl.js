/* Inline Edit function */


function getNextValidRow(cell) {
    var nextRow = $(cell).parent().next();
    while (nextRow.css('display') == 'none') {
        nextRow = $(nextRow).next();
    }
    return nextRow;
}

function getPrevValidRow(cell) {
    var nextRow = $(cell).parent().prev();
    while (nextRow.css('display') == 'none') {
        nextRow = $(nextRow).prev();
    }
    return nextRow;
}

var selectedRows = [];
var currentIndex;

function selectRow(rowNum) {
    selectedRows[rowNum] = rowNum;
    $('#tr_' + rowNum).addClass("selectedRow");
}

function deselectRow(rowNum) {
    selectedRows[rowNum] = null;
    $('#tr_' + rowNum).removeClass("selectedRow");
}

function deselectAllRows() {
    for (var i in selectedRows) {
        $('#tr_' + i).removeClass("selectedRow");
    }
    selectedRows = [];
}

function getRowNumFromId(id) {
    start = id.indexOf('_') + 1;
    end = id.indexOf('_', start);
    if (end == -1) {
        return id.substring(start);
    }
    return id.substring(start, end);
}

function toggleRow(rowNum) {
    if (selectedRows[rowNum] == null) {
        selectRow(rowNum);
    } else {
        deselectRow(rowNum);
    }
}

var startMode = null;

function startSelectionByButton() {
    if (startMode != null) {
        startMode = null;
        $('#infoDiv').text("");
        $('#selectRangeButton').removeClass('selectRange');
        return;
    }
    if (currentIndex == null) {
        alert('Select starting row by clicking an editable cell');
        return;
    }
    startMode = currentIndex;
    $('#selectRangeButton').addClass('selectRange');
    var str = "Click on last row of your selection. Starting selection from row " + currentIndex;
    document.getElementById("infoDiv").innerHTML = str;

}

function initiateRowSelection(rowNum) {
    currentIndex = rowNum;
    if (startMode != null) {
        selectRange(startMode, currentIndex);
        $('#infoDiv').text("Selected rows from " + startMode + " to " + currentIndex);
        startMode = null;
        $('#selectRangeButton').removeClass('selectRange');
    } else {
        if (!cntrlIsPressed) deselectAllRows();
        toggleRow(currentIndex);
    }
}

function startSelection(e) {
    var target = e.target || e.srcElement;
    var index = getRowNumFromId(target.id);
    initiateRowSelection(index);
}

function endSelection(e) {
    var target = e.target || e.srcElement;
    var endIndex = getRowNumFromId(target.id);
    if (currentIndex != endIndex) {
        selectRange(currentIndex, endIndex);
    }
}

function selectRange(start, end) {
    if (start > end) {
        swap = start;
        start = end;
        end = swap;
    }
    for (var i = start; i <= end; i++) {
        selectRow(i);
    }
}


// $(function() {
//   $('.htmlgrid-div').on('mouseover', function() {
//         if($(this).scrollTop() + $(this).innerHeight() >= $(this).scrollHeight) {
//             alert('end reached');
//         }
//     })
// });

$(document).keydown(function(event) {
    if (event.which == "17")
        cntrlIsPressed = true;
});

$(document).keyup(function() {
    cntrlIsPressed = false;
});

var cntrlIsPressed = false;


function editSelected() {
    if (selectedRows.length < 1) {
        alert('Select rows to be edited.');
        return;
    }

    showOverlay();

    var editableColumnsStr = document.forms[1].editableColumns.value;
    var editableColumns = editableColumnsStr.split(",");
    for (var j = 0; j < editableColumns.length; j++) {
        var dialogInput = null;
        for (var row in selectedRows) {
            var formInput = document.getElementsByName(editableColumns[j] + row)[0].value;
            if (dialogInput == null) {
                dialogInput = formInput;
                document.getElementById("dialog_" + editableColumns[j]).value = dialogInput;
            } else if (dialogInput != formInput) {
                document.getElementById("dialog_" + editableColumns[j]).value = "?";
                break;
            }
        }
    }

    // Hide remaining non editable inputs
    table = document.getElementById("dialog_table");
    inputs = table.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        var inputName = inputs[i].id.substring(inputs[i].id.lastIndexOf("_") + 1);
        //console.log(inputName);
        var found = false;
        for (var j = 0; j < editableColumns.length; j++) {
            if (inputName == editableColumns[j]) {
                found = true;
                break;
            }
        }
        if (!found) {
            //console.log('disable ' + inputs[i].id)
            inputs[i].disabled = "true";
            inputs[i].style.backgroundColor = "#f1f1f1";
        }
    }
}



function saveSelected() {
    table = document.getElementById("dialog_table");
    inputs = table.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].disabled != "true" && inputs[i].value!="" && isNumber(inputs[i].value)) {
            var inputName = inputs[i].id.substring(inputs[i].id.lastIndexOf("_") + 1);
            var totalOut = "Total_" + inputName;
            var total = document.getElementById(totalOut);
            for (var row in selectedRows) {
                elem = document.getElementsByName(inputName + row)[0];
                var oldVal = elem.value==""? 0: elem.value;
                elem.value = inputs[i].value;
                console.log(total.innerText + " " + inputs[i].value + " "+ oldVal)
                total.innerText = (parseFloat(total.innerText) + parseFloat(inputs[i].value) - oldVal);
            }
        }
    }
    hideOverlay();
}

function showOverlay() {
    el = document.getElementById("overlay");
    el.style.visibility = "visible";
    selects = document.getElementsByTagName("select");
    for (var i = 0; i < selects.length; i++) {
        selects[i].style.visibility = "hidden";
    }
}

function hideOverlay() {
    el = document.getElementById("overlay");
    el.style.visibility = "hidden";
    var selects = document.getElementsByTagName("select");
    for (var i = 0; i < selects.length; i++) {
        selects[i].style.visibility = "visible";
    }
}

function deselectCell(cell) {
    $(cell).removeClass("highlighted");
}

function selectCell(cell) {
    cell.oldValue = cell.value;
    // $(selectedCell).removeClass("highlighted")
    $(cell).addClass("highlighted");
}

function focusNext(cell) {
    // selectCell(cell);
    setTimeout(function() {
        var $input = $(cell).find("input");
        $input.focusTextToEnd();
    }, 100);
}


function moveToNextCell(cell, shiftKey, direction, edit) {
    var nextCell = null;
    $(cell).removeClass("highlighted");
    if ((shiftKey && direction == 9) || direction == 37) {
        // Shift Tab event.shiftKey &&  event.keyCode == 9
        // Left arrow 37
        var nextCell = $(cell).prev();
        while (nextCell.html() != null && nextCell.hasClass("readOnlyCell")) {
            nextCell = $(nextCell).prev();
        }
        if (nextCell.html() == null) {
            nextCell = $(getPrevValidRow(cell)).find(">:last-child");
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
            nextCell = $(getNextValidRow(cell)).find(">:first-child");
            while (nextCell.hasClass("readOnlyCell")) {
                nextCell = $(nextCell).next();
            }
        }
    } else if (direction == 38) {
        // Up arrow 38
        var cellIndex = $(cell).prevAll().length + 1;
        nextCell = $(getPrevValidRow(cell)).find(">:nth-child(" + cellIndex + ")");
    } else if (direction == 40) {
        // Down Arrow 40
        var cellIndex = $(cell).prevAll().length + 1;
        nextCell = $(getNextValidRow(cell)).find(">:nth-child(" + cellIndex + ")");
    }
    if (nextCell == null || nextCell.html() == null) {
        nextCell = cell;
    }
    focusNext(nextCell);

}

$.fn.focusTextToEnd = function() {
    this.focus();
    var $thisVal = this.val();
    this.val('').val($thisVal);
    return this;
}

function navigate(e, input, $td) {
    var keyCode = e.keyCode || e.which;
    if (e.shiftKey || keyCode == 13 || keyCode == 27 || keyCode == 38 || keyCode == 40 || keyCode == 9 || keyCode == 37 || keyCode == 39) {
        moveToNextCell($td, e.shiftKey, keyCode, false)
    } else if (keyCode != 8 && keyCode != 46) {
        txtVal = $(input).val() + String.fromCharCode(keyCode);
        if (!isNumber(txtVal)) {
            e.returnValue = false;
        }
    }
}

function isNumber(o) {
    return o == '' || !isNaN(o - 0);
}

// $(".htmlgrid-table").keydown(function(e) {
//     var target = $(e.target);
//     var $td = target.closest('td');
//     if ($td.find('input').length) {
//         navigate(e, $td);
//     }
// });
//
// $(".htmlgrid-table").click(function(e) {
//     var target = $(e.target);
//     var $td = target.closest('td');
//     if ($td.find('input').length) {
//         focusNext($td);
//     }
// });

$(function() {
    $('.filter').keyup(function() {
        var $input = $(this);
        delay(function() {
            filter($input);
        }, 1000);
    });

    var delay = (function() {
        var timer = 0;
        return function(callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

    function filter(input) {
        var $input = $(input);
        var min, max;
        if ($input.hasClass('filter-min')) {
            min = parseInt($input.val());
            max = parseInt($input.parent().find('.filter-max').val());
        } else {
            min = parseInt($input.parent().find('.filter-min').val());
            max = parseInt($input.val());
        }
        if (isNaN(min)) min = null;
        if (isNaN(max)) max = null;

        var $table = $('.htmlgrid-table-body'),
            $rows = $table.find('tbody tr');
        var column = $input.parent().parent().find('th').index($input.parents('th'));
        var $filteredRows = $rows.filter(function() {
            var value = parseInt($(this).find('td').eq(column).find('input').val());
            if (((min || max) && isNaN(value)) || (min && value < min) || (max && value > max)) {
                $(this).css('display', 'none');
            } else {
                $(this).css('display', '');
            }
        });
    }

    // end of root
});

function calculateTotal(element) {

    if (element.oldValue != element.value) {
        var newVal = parseFloat(element.value);
        var oldVal = parseFloat(element.oldValue);
        if (isNaN(oldVal)) oldVal = 0;
        if (isNaN(newVal)) newVal = 0;
        var colName = element.name.replace(/[0-9]/g, '');
        var totalOut = "Total_" + colName;
        var total = document.getElementById(totalOut);
        // alert(total.innerText + newVal + oldVal)
        total.innerText = (parseFloat(total.innerText) + newVal - oldVal);
    }
}


// $(function() {
//     $('.htmlgrid-input').focus(function() {
//       selectCell(this);
//     });
//     $('.htmlgrid-input').blur(function() {
//       deselectCell(this);
//     });
//     $('.htmlgrid-input').change(function() {
//       calculateTotal(this);
//     });
// });
