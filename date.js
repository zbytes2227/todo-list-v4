
function dateNow() {
    var date_options = { weekday: 'long', month: 'long', day: 'numeric' };
    var today = new Date();
    var date_now = today.toLocaleDateString("en-US", date_options);
    return date_now;
}

module.exports = { dateNow };