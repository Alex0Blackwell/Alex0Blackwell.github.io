var stats = {
    'wpm': 0,
    'wordsRead': 0,
    'completeRead': 0,
};


var interval = -1;
var i = 0;
function main(stopFlag) {
    if(stopFlag) {
        clearInterval(interval);
        document.getElementById("goBtn").disabled = false;
    } else {
        document.getElementById("goBtn").disabled = true;
        // if there is an interval running don't start a new one
        var words = [];
        var inputStr = document.getElementById("contentIn").value;
        words = inputStr.split(" ");
        var wpmMs = getWpmMs();
        interval = setInterval(updateTxt, wpmMs, words);

        function updateTxt(words) {
            var dispEl = document.getElementById("displayWord");
            if(i >= words.length) {
                clearInterval(interval);
                document.getElementById("goBtn").disabled = false;
                stats.wordsRead += i;
                i = 0;
                stats.completeRead++;
                dispEl.innerHTML = "Enter something new or read again!";
            } else {
                dispEl.innerHTML = words[i];
                i++;
            }
        }
    }

}


function getWpmMs() {
    var wpm = document.getElementById("wpmInput").value;
    stats.wpm = wpm;
    // now convert to ms; min -> ms =/ 60000
    return 60000 / wpm;
}
