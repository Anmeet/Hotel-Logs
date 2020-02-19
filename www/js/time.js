/* Get date & time */
function getDateAndTime() {
    var d = new Date();
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}
        ${d.toTimeString().substr(0, 8)}`;
}

/* Set time */
function setTime() {
    time = getDateAndTime();
    $('#btn-time').hide();
    $('#txt-time').text(time);
}