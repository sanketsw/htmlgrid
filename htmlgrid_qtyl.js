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

// hasClass = function (element, name) {
// 	var classes = element.className.split(" "),
// 		hasClass = false;
// 	for (var i = 0; i < classes.length; i++) {
// 		if (classes[i] === name) {
// 			return true;
// 		}
// 	}
// 	return false;
// };
// removeClass = function (element, name) {
// 	if (hasClass(element, name)) {
// 		element.className = element.className.replace(name, '');
// 		return true;
// 	} else {
// 		return false;
// 	}
// };
// addClass = function (element, name) {
// 	if (!hasClass(element, name)) {
// 		element.className += ' ' + name;
// 		return true;
// 	} else {
// 		return false;
// 	}
// };
//
// function selectCell(cell) {
//     var newElem = document.getElementById(cell);
//     if (selectedCell) {
//         var elem = document.getElementById(selectedCell);
//         removeClass(elem, "highlighted");
//     }
//     addClass(newElem, "highlighted");
//     selectedCell = cell;
// }

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
    } else if(keyCode != 8 && keyCode != 46) {
      txtVal = $(input).val() + String.fromCharCode(keyCode);
      if(!isNumber(txtVal)) {
        e.returnValue = false;
      }
    }
}

function isNumber (o) {
  return o == '' || ! isNaN (o-0);
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

    if(element.oldValue != element.value) {
      var newVal = parseFloat(element.value);
      var oldVal = parseFloat(element.oldValue);
      if(isNaN(oldVal)) oldVal = 0;
      if(isNaN(newVal)) newVal = 0;
      var colName = element.name.replace(/[0-9]/g, '');
      var totalOut = "Total_"+colName;
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
