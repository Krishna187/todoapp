$(document).ready(function() {
    //Load the data using this variable on page load for the very first time
    function reFreshData() {
        var currentData = showData();
        //by importance
        if (currentData) {
            var importanceCategoryData = searchByImportance(currentData.items);
            $('#totalCount').text(currentData.items.length);

            var veryHighCount = importanceCategoryData.veryHigh.length;
            $('#veryHighCount').text(veryHighCount);
            var highCount = importanceCategoryData.high.length;
            $('#highCount').text(highCount);
            var normalCount = importanceCategoryData.normal.length;
            $('#normalCount').text(normalCount);
            //by dates
            var dateCategoryDate = searchByPredefinedDates(currentData.items);
            var todayCount = dateCategoryDate.today.length;
            console.log("todays count: " + todayCount);
            $('#todayCount').text(todayCount);
            var thisWeekCount = dateCategoryDate.thisWeek.length;
            $('#thisWeekCount').text(thisWeekCount);
            var lastWeekCount = dateCategoryDate.lastWeek.length;
            $('#lastWeekCount').text(lastWeekCount);
            var thisMonthCount = dateCategoryDate.thisMonth.length;
            $('#thisMonthCount').text(thisMonthCount);

            //recent items
            var recent = getRecentToDos(currentData.items);

            $('#recent ul.list-group').empty();
            if (!$('#noItem').hasClass('hide')) {
                $('#noItem').addClass('hide');
            }
            //populate the recent data
            $.each(recent, function(index, value) {
                var importanceClass = "";
                var completed = "";
                var checked = "";
                if (value.isCompleted) {
                    completed = "completed-item";
                    checked = "checked";
                }
                if (value.importance.toLowerCase() == "veryhigh") {
                    importanceClass = "veryHighList";
                } else if (value.importance.toLowerCase() == "high") {
                    importanceClass = "highList";
                } else {
                    importanceClass = "normalList";
                }

                $('#recent ul.list-group').append('<li class="list-group-item ' + importanceClass + '"><label class="form-check-label ' + completed + '">' +
                    '<input data-id="' + value.id + '" type="checkbox" class="form-check-input changeStatus" value="" ' + checked + '>' + value.name + '</label><i data-id="' + value.id + '"  class="fa fa-trash float-right trash">' +
                    '</i><p class="small-text">Due Date: ' + toMMDDYYYYString(new Date(value.dueDate)) + '</p></li>');
            });

        } else {
            $('#recent ul.list-group').empty();
            if ($('#noItem').hasClass('hide')) {
                $('#noItem').removeClass('hide');
            }

        }

    }
    // create Calendar from div HTML element
    $("#mainCalendar").kendoCalendar({
        format: "MM/dd/yyyy",
        change: calendarChange

    });
    $("#fromDate").kendoDatePicker({

        // display month and year in the input
        format: "MM/dd/yyyy",
    });
    $("#toDate").kendoDatePicker({

        // display month and year in the input
        format: "MM/dd/yyyy",
    });
    //Class to create todo Object
    function Todo(id, name, dueDate, importance, isCompleted) {
        this.id = id;
        this.name = name;
        this.dueDate = dueDate;
        this.importance = importance;
        this.isCompleted = isCompleted;
    }
    //Class declaration ends
    /****************LOCAL STORAGE STUFFS***************/
    if (typeof(Storage) !== "undefined") {

    } else {
        alert("Local storage not supported.")
    }
    /****************LOCAL STORAGE STUFFS ENDS***************/
    //stored using the key="todos"
    function getDataFromLocalStorage() {
        return JSON.parse(localStorage.getItem("todos"));
    }
    //stored using the key="todos"
    function setDataToLocalStorage(data) {
        if (data) {
            if (localStorage["todos"]) {
                localStorage.clear();
                localStorage.setItem("todos", JSON.stringify(data));
            } else {
                localStorage.setItem("todos", JSON.stringify(data));
            }

        }
    }
    //Users CRUD operations
    function addToDoList(name, dueDate, importance, isCompleted) {
        //get the local storage data // get the index of the highest item // add to the list //set the localstorage
        currentData = getDataFromLocalStorage();

        if (!currentData) {
            var currentData = {
                index: 0,
                items: []
            };
            currentData.index += 1;
            var toDo = new Todo(currentData.index, name, dueDate, importance, isCompleted);
            currentData.items.push(toDo);
            setDataToLocalStorage(currentData);
        } else {
            currentData.index += 1;
            var toDo = new Todo(currentData.index, name, dueDate, importance, isCompleted);
            currentData.items.push(toDo);
            setDataToLocalStorage(currentData);
        }

    }
    //Display all the items
    function showData() {
        return getDataFromLocalStorage();
    }
    //change from completedToNotCompletedAndViceVersa
    function changeStatusOfAToDo(id) {
        //Search for the items
        var currentData = showData();
        if (currentData) {
            //Check to see if there is any item in the storage
            if (currentData.index > 0) {
                if (currentData.items[id - 1].isCompleted) {
                    currentData.items[id - 1].isCompleted = false;
                } else {
                    currentData.items[id - 1].isCompleted = true;
                }
                setDataToLocalStorage(currentData);
            }
        }

    }

    //Delete item from the storage
    function deleteItem(id) {
        var currentData = showData();
        if (currentData) {
            if (currentData.index == 1) {
                localStorage.clear();
            } else {
                currentData.index -= 1;
                currentData.items = removeItemFromArray(currentData.items, currentData.index);
                setDataToLocalStorage(currentData);
            }

        }
    }
    //Utility methods- this will return a new array
    function removeItemFromArray(array, index) {
        return array.filter(e => e !== array[index]);
    }

    /***************SEARCH AND FILTER UTILITIES */
    //search for an item by importance
    function searchByImportance(currentData) {
        var result = { veryHigh: [], high: [], normal: [] };
        if (currentData) {
            result.veryHigh = currentData.filter(function(element) {
                return element.importance.toLowerCase() == "veryhigh";
            });
            result.high = currentData.filter(function(element) {
                return element.importance.toLowerCase() == "high";
            });
            result.normal = currentData.filter(function(element) {
                return element.importance.toLowerCase() == "normal";
            });

        }
        return result;
    }
    //search by completion status
    function searchByCompletion(currentData) {
        var result = { completed: [], notCompleted: [] };
        if (currentData) {

            result.completed = currentData.filter(function(element) {

                return element.isCompleted == true;
            });
            result.notCompleted = currentData.filter(function(element) {

                return element.isCompleted == false;
            });

        }
        return result;
    }

    //search between dates
    function searchBetweenDates(fromDate, toDate) {
        var result = {
            total: 0,
            completed: [],
            notCompleted: []
        };
        //not implemented yet
        return result;
    }
    //search by predefined dates
    function searchByPredefinedDates(currentData) {
        var result = {
            today: [],
            thisWeek: [],
            lastWeek: [],
            thisMonth: []

        };
        if (currentData) {
            result.today = currentData.filter(function(element, index) {
                return toMMDDYYYY(new Date(element.dueDate)).getTime() == toMMDDYYYY(new Date()).getTime();
            });
            result.thisWeek = currentData.filter(function(element, index) {
                var startDate = getStartAndEndDate("thisweek").start;
                var endDate = getStartAndEndDate("thisweek").end;
                return toMMDDYYYY(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYY(new Date(element.dueDate)).getTime() <= endDate;
            });
            result.lastWeek = currentData.filter(function(element, index) {

                var startDate = getStartAndEndDate("lastweek").start;
                var endDate = getStartAndEndDate("lastweek").end;
                return toMMDDYYYY(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYY(new Date(element.dueDate)).getTime() <= endDate;
            });
            result.thisMonth = currentData.filter(function(element, index) {
                var startDate = getStartAndEndDate("thismonth").start;
                var endDate = getStartAndEndDate("thismonth").end;
                return toMMDDYYYY(new Date(element.dueDate)).getTime() >= startDate && toMMDDYYYY(new Date(element.dueDate)).getTime() <= endDate;
            });

        }
        return result;
    }
    //based on the params, it will generate start and end date
    function getStartAndEndDate(range) {
        let result = { start: new Date(), end: new Date() };
        if (range.toLowerCase() == "today") {
            result.start = toMMDDYYYY(new Date());
            result.end = toMMDDYYYY(new Date());
        }
        if (range.toLowerCase() == "thisweek") {
            var current = new Date();
            var diff = current.getDate() - current.getDay();
            result.start = toMMDDYYYY(new Date(current.setDate(diff)));
            result.end = toMMDDYYYY(new Date(current.setDate(result.start.getDate() + 6)));
        }
        if (range.toLowerCase() == "lastweek") {
            var today = new Date();
            var todaysDay = today.getDay();
            var goBack = today.getDay() % 7 + 7;
            var lastSunday = new Date().setDate(today.getDate() - goBack);
            result.start = toMMDDYYYY(new Date(lastSunday));
            result.end = toMMDDYYYY(new Date(today.setDate(result.start.getDate() + 6)));
        }
        if (range.toLowerCase() == "thismonth") {
            var date = new Date(),
                year = date.getFullYear(),
                month = date.getMonth();
            result.start = toMMDDYYYY(new Date(year, month, 1));
            result.end = toMMDDYYYY(new Date(year, month + 1, 0));
        }
        return result;
    }
    //pass a date and get the weej start
    //params: date to get the week start
    function getStartOfWeek(date) {
        var d = new Date(+date);
        var shift = d.getDay();
        d.setDate(d.getDate() - shift);
        return d;
    }


    /*************DATE UTILITIES************/
    //convert to mm/dd/yyyy
    function toMMDDYYYY(date) {
        var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
        return new Date(dateInMMDDYYYY);
    }
    //convert to mm/dd/yyyy
    function toMMDDYYYYString(date) {
        var dateInMMDDYYYY = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
        return dateInMMDDYYYY;
    }
    //removes the millisecond part
    function formatDate(date) {
        var dateInMMDDYYYY = date.substr(0, 10);
        return dateInMMDDYYYY;
    }

    //get todos for today
    function getTotalitemsToday() {
        var allTodosForToday = [];
        return allTodosForToday;
    }
    //get todos for this week
    function getTotalitemsThisWeek() {

        var allTodosForThisWeek = [];
        return allTodosForThisWeek;
    }
    //get todos for last week
    function getTotalitemsLastWeek() {

        var allTodosForLastWeek = [];
        return allTodosForLastWeek;
    }
    //get todos for this month
    function getTotalitemsThisMonth() {

        var allTodosForThisMonth = [];
        return allTodosForThisMonth;
    }

    /**************CATEGORY HELPER */

    //get todos with high imp
    function getTotalHighItems(data) {
        var allHighTodos = searchByImportance(data).veryHigh;
        return allHighTodos;
    }
    //get todos with very high imp
    function getTotalVeryHighItems(data) {

        var allVeryHighTodos = searchByImportance(data).high;
        return allVeryHighTodos;
    }
    //get todos with normal imp
    function getTotalNormalItems(data) {
        var allNormalTodos = searchByImportance(data).normal;
        return allNormalTodos;
    }

    /**************IS COMPLETED HELPER */
    //get todos with high imp
    function getTotalCompletedItems(data) {

        var allCompleted = searchByCompletion(data).completed;
        return allCompleted;
    }
    //get todos with high imp
    function getTotalNotCompletedItems(data) {
        var allNotCompleted = searchByCompletion(data).notCompleted;
        return allNotCompleted;
    }
    //gets the 5 recent items
    function getRecentToDos(currentData) {
        var total = currentData != null ? currentData.length : 0;
        if (total > 5) {
            var filteredData = currentData.filter(function(element) {
                return element.id > (total - 5);
            });

            filteredData.sort(function(a, b) {
                var dateA = new Date(a.dueDate),
                    dateB = new Date(b.dueDate);
                return dateB - dateA;
            });
            return filteredData;

        } else {

            currentData.sort(function(a, b) {
                var dateA = new Date(a.dueDate),
                    dateB = new Date(b.dueDate);
                return dateB - dateA;
            });
            return currentData;
        }
    }
    /******************EVENT HANDLING PARTS ONLY********************** */

    //Display selected date on the calendar on load
    var calendar = $("#mainCalendar").data('kendoCalendar');
    var dateSelected = calendar.current();
    displayCalendarValue(toMMDDYYYYString(dateSelected));
    //to Display the value of the calendar on the text
    function displayCalendarValue(val) {
        var selecteDateId = "#selectedDate";
        $(selecteDateId).text(val);
    }
    //When calendar value changes, change the dates as well
    function calendarChange() {
        dateSelected = this.value();
        displayCalendarValue(dateSelected.toLocaleDateString())
    }
    //create an alert messgae
    function createAlert(message) {
        $("#actionAlert #alertMessage").text(message);
        $("#actionAlert").show();
        $("#actionAlert").fadeTo(2000, 500).slideUp(500, function() {
            $("#actionAlert").slideUp(500);
        });

    }

    //When an item is created
    $('#createForm').submit(function(event) {
        event.preventDefault();
        //Gather form data
        var dueDate = dateSelected;
        var formData = $(this).serializeArray();
        var name = formData[0].value;
        var importance = formData[1].value;
        addToDoList(name, dueDate, importance, false);
        reFreshData();
        //show alert
        createAlert("You just created a todo list. Add more...");
    });

    //when users click on the checkbox

    $("#recent").on('change', '.changeStatus', function() {
        var currentData = showData();
        var index = $(this).attr("data-id");
        var message = "status changed";
        if (this.checked) {

            currentData.items[index - 1].isCompleted = true;
            message = "You have marked a todo list as completed";
        } else {
            currentData.items[index - 1].isCompleted = false;
            message = "You have marked a todo list as incomplete";
        }
        setDataToLocalStorage(currentData);
        reFreshData();
        //show alert
        createAlert(message);


    });
    //on delete event
    $("#recent").on('click', '.trash', function() {
        var index = $(this).attr("data-id");
        if (confirm("Are you sure you would like to delete this item?")) {
            deleteItem(index);
            reFreshData();
            createAlert("You have deleted a todo list");
        }


    });

    //delte all the storage data
    $('#deleteAll').on('click', function() {
        if (confirm("This action will remove all your data. Are you sure?")) {
            if (localStorage["todos"]) {
                localStorage.clear();
                location.reload(true);
            } else {
                alert("You do not have any information stored on this website. Please create todos first");
            }

        }

    });
    /*************MODAL OPERATIONS */
    //When users click on the items on the left panel 
    $('.category').on('click', 'p', function() {
        $('#toDoModal').modal('show');
    });
    $('#todoModal').on('hide.bs.modal', function() {
        //remove items from the modal
    });


    //creates html for the modal window
    //category 1= importance, type 2 is dates, type 3 is completion data-filter is the filter condition
    function createHTMLForModal(category, filter) {
        //this is the importance category
        if (category == "1") {

        }
        //this is the date category
        else if (category == "2") {

        }
        //this is the completion category
        else if (category == "3") {

        } else {
            //nothing will happen here
        }

    }

    /*************MODAL OPERATIONS */
    reFreshData();

});