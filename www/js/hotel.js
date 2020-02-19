var list = ["Book Room","Saved Booking"],
    lastIndex = list.length - 1,
    geoLocation = null,
    time = null,
    localId = localStorage.getItem('hotelID'),
    hotelID = localId ? parseInt(localId, 10) : 0,
    prevId = lastIndex,
    nextId = 1,
    hotelName = list[hotelID];



/* Get date & time */
function getDateAndTime() {
    var d = new Date();
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}
        ${d.toTimeString().substr(0, 8)}`;
}

/* Get ID of hotel */
function getId(id) {
    var d = $('#hotel');
    hotelID = parseInt(id, 10);
    localStorage.setItem('hotelID', hotelID.toString());
    prevId = (hotelID === 0) ? lastIndex : (hotelID - 1);
    nextId = (hotelID === lastIndex) ? 0 : (hotelID + 1);
    hotelName = list[hotelID];
    document.title = hotelName;
    d.find('h1').text(hotelName);
    return clear();
}

/* Save to store */
function saveToStorage(obj) {
    try {
        var storage = hotelName+'_items',
            data = localStorage.getItem(storage);

        data = data ? JSON.parse(data) : [];
        data.push(obj);
        localStorage.setItem(storage, JSON.stringify(data));
        clear();
        return alert("Booking  has been saved!");
    } catch (e) {
        console.log(e);
        return alert("Booking is not saved. Please fix the problem and try again!");
    }
}

/* Get from store */
function getFromStorage() {
    var data = localStorage.getItem(hotelName+'_items');
    return data ? JSON.parse(data) : [];
}

/* Go to main page */
function goToMain() {
    window.location.href="#main";
    alert("Booking Confirmed");
}

/* Save logs to cloud storage */
function saveToCloud() {
    var data = getFromStorage();

    if (data.length === 0) {
        return goToMain();
    }

    $.ajax({
        type: 'POST',
        url: "/hotellogs/" + hotelName + "/hotellogs",
        dataType: 'json',
        data: { data },
        success: function (data) {
            localStorage.removeItem(hotelName+'_items');
            goToMain();
        },
        error: function(err) {
            alert("Booking not confirmed. Please check your setting.");
        }
    });
}

/* Get the paragraph string */
function getString(eStr, data) {
    var str = '<ul data-role="listview">';
    if (data.length > 0) {
        for (var i = 1; i < data.length; i++) {
            str +="Booking"+" "+i+"<br><br>"+"MemberNumber: "+ data[i].MemberNumber +"<br>"+"Name: "+ data[i].Name + "<br>" +"Address: "+ data[i].Address + "<br>" +"Contact: " +data[i].contact +"<br>"+"CheckInDate: "+data[i].CheckInDate+"<br>"+"CheckOutDate: "+data[i].CheckOutDate+ "<br>" +"Room: " +data[i].Room+"<br><br>";
        }
    } else {
        str += "<li>No current Bookings  " + eStr + " storage!!</li>";
    }
    str += "</ul>";

    return str;
}

/* Get the logs */
function getLogs() {
    var l = $('#currentLogs'), data = getFromStorage();

    l.find('h1').text(hotelName);
    l.find('div#logsList').html(getString("local", data));
}

/* Get the logs from cloud */
function getLogsFromCloud() {
    var l = $('#hotelLogs');
    l.find('h1').text(hotelName);

    $.ajax({
        type: 'GET',
        url: "/search/" + hotelName,
        success: function (data) {
            l.find('div#logsList').html(getString("local", data.data));
        },
        error: function(err) {
            alert("Can´t get your booking!!");
        }
    });
}

/* Save the logs */
function saveLogs() {
    var d = $('#hotel'),
        MemberNumber = d.find('input#serial').val(),
		Name = d.find('input#Name').val(),
        Address = d.find('input#Address').val(),
        contact = d.find('input#contract').val(),
        CheckInDate = d.find('input#checkindate').val(),
        CheckOutDate = d.find('input#checkoutdate').val(),
        Room = $("#category :selected").text();
		time = getDateAndTime();

    if (!geoLocation) {
        return alert("Unknown location!");
    }
    if (!serial) {
        return alert("MemberNumber must be 4 character");
    }
    if (!Name) {
        return alert(" Name must be a non empty name string");
    }
    if (!Address) {
        return alert("Address must be entered");
    }
    if (!contract) {
        return alert("Contact Number must be entered");
    }
    if (parseInt(category, 10) < 0) {
        return alert("Select a Room Category!");
    }

    return saveToStorage({
        hotel: hotelName,
		time:time,
        MemberNumber: MemberNumber,
        Name:Name,
        Address:Address,
        contact:contact,
        CheckInDate:CheckInDate,
        CheckOutDate:CheckOutDate,
        Room:Room,
    });
}

/* Send the logs */
function sendLogs() {
    if (confirm("Do you want to confirm booking?")) {
        return saveToCloud();
    }
    return null;
}

/* Get longitude and latitude */
function getGeoLocation() {
    var options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    function success(pos) {
        geoLocation = pos.coords;
    }
    function error(err) {
        alert("ERROR ("+ err.code + "): " + err.message);
    }
    return navigator.geolocation.getCurrentPosition(success, error, options);
}

/* Clear form */
function clear() {
    var d = $('#hotel');
    d.find('input#serial').val(null);
    d.find('input#Name').val(null);
    d.find('input#Address').val(null);
    d.find('input#contract').val(null);

d.find('input#checkindate').val(null);
    d.find('input#checkoutdate').val(null);

    d.find('select#category').val(null);
    time = null;
    return null;
}

/* Set time */
function setTime() {
    time = getDateAndTime();
    $('#btn-time').hide();
    $('#txt-time').text(time);
}

/* On document loads */
$(document).ready(function () {
    $(document).on('pageinit', '#hotel', function (event) {
        event.preventDefault();
        if (!geoLocation) {
            getGeoLocation();
        }
        $("#btn-clear").on('click', function () {
            clear();
        });
        $("#prev").on('click', function () {
            getId(prevId);
        });
        $("#next").on('click', function () {
            getId(nextId);
        });
    });
    $(document).on("pageshow", "#hotel", function () {
        document.title = hotelName;
        clear();
        getId(hotelID);
    });
    $(document).on("pageshow", "#currentLogs", function () {
        document.title = hotelName;
        getLogs();
    });
    $(document).on("pageshow", "#hotelLogs", function () {
        document.title = hotelName;
        getLogsFromCloud();
    });
});