var list = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
    lastIndex = list.length - 1,
    geoLocation = null,
    time = null,
    localId = localStorage.getItem('droneID'),
    droneID = localId ? parseInt(localId, 10) : 0,
    prevId = lastIndex,
    nextId = 1,
    droneName = list[droneID];
	
	

/* Get date & time */
function getDateAndTime() {
    var d = new Date();
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}
        ${d.toTimeString().substr(0, 8)}`;
}

/* Get ID of Drone */
function getId(id) {
    var c = $('#drone');
    droneID = parseInt(id, 10);
    localStorage.setItem('droneID', droneID.toString()); 
    prevId = (droneID === 0) ? lastIndex : (droneID - 1);
    nextId = (droneID === lastIndex) ? 0 : (droneID + 1);
    droneName = list[droneID];
    document.title = droneName;
    c.find('h1').text(droneName);
    return clear();
}

/* Save to store */
function saveToStorage(obj) {
    try {
        var storage = droneName+'_items',
            data = localStorage.getItem(storage);
            
        data = data ? JSON.parse(data) : [];
        data.push(obj);
        localStorage.setItem(storage, JSON.stringify(data));    
        clear();
        return alert("Your log has been saved!");
    } catch (e) {
        console.log(e);
        return alert("Log not saved. Please fix the problem and try again!");
    }
}

/* Get from store */
function getFromStorage() {
    var data = localStorage.getItem(droneName+'_items');
    return data ? JSON.parse(data) : [];
}

/* Go to main page */
function goToMain() {
    window.location.href="#main";
    alert("Logs have been sent!!");
}

/* Save logs to cloud storage */
function saveToCloud() {
    var data = getFromStorage();
    
    if (data.length === 0) {
        return goToMain();
    }

    $.ajax({
        type: 'POST',
        url: "/dronelogs/" + droneName + "/dronelogs",
        dataType: 'json',
        data: { data },
        success: function (data) {
            localStorage.removeItem(droneName+'_items');
            goToMain();
        },
        error: function(err) {
            alert("Could not send logs to cloud!!");
        }
    });
}

/* Get the paragraph string */
function getString(eStr, data) {
    var str = '<ul data-role="listview">';
    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            str += "<li>" + data[i].time + ", ( lat: " + data[i].latitude + ", long: " + data[i].longitude + "),"+ data[i].id + ","+ data[i].pilot + ", " + data[i].key + ", " + data[i].contract + "," + data[i].category + " </li>";
        }
    } else {
        str += "<li>No current logs in " + eStr + " storage!!</li>";
    }
    str += "</ul>";
    
    return str;
}

/* Get the logs */
function getLogs() {
    var l = $('#currentLogs'), data = getFromStorage();
    
    l.find('h1').text(droneName);
    l.find('div#logsList').html(getString("local", data));
}

/* Get the logs from cloud */
function getLogsFromCloud() {
    var l = $('#droneLogs');
    l.find('h1').text(droneName);
    
    $.ajax({
        type: 'GET',
        url: "/search/" + droneName,
        success: function (data) {
            l.find('div#logsList').html(getString("local", data.data));
        },
        error: function(err) {
            alert("Could not get logs from cloud!!");
        }
    });
}

/* Save the logs */
function saveLogs() {
    var c = $('#drone'),
        id = c.find('input#id').val(),
		pilot = c.find('input#pilot').val(),
        key = c.find('input#key').val(),
        contract = c.find('input#contract').val(),
        category = $("#category :selected").text();
		time = getDateAndTime();
    
    if (!geoLocation) {
        return alert("Unknown location!");
    }
    if (!id) {
        return alert("Drone serial code must be 4 character");
    }
    if (!pilot) {
        return alert("Drone Pilot must be a non empty name string");
    }
    if (!key) {
        return alert("Drone Key must be enter");
    }
    if (!contract) {
        return alert("Drone Key must be enter");
    }
    if (parseInt(category, 10) < 0) {
        return alert("Select a Category!");
    }

    return saveToStorage({
        drone: droneName,
		time:time,
        id: id,
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
        pilot:pilot,
        key:key,
        contract:contract,
        category: category,
    });
}

/* Send the logs */
function sendLogs() {
    if (confirm("Do you want to send all the logs, this has the effect of deleting all logs?")) {
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
    var c = $('#drone');
    c.find('input#id').val(null);
    c.find('input#pilot').val(null);
    c.find('input#key').val(null);
    c.find('input#contract').val(null);
    c.find('select#category').val(null);
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
    $(document).on('pageinit', '#drone', function (event) {
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
    $(document).on("pageshow", "#drone", function () {
        document.title = droneName;
        clear();
        getId(droneID);
    });
    $(document).on("pageshow", "#currentLogs", function () {
        document.title = droneName;
        getLogs();
    });
    $(document).on("pageshow", "#droneLogs", function () {
        document.title = droneName;
        getLogsFromCloud();
    });
});