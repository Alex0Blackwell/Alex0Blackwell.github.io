const wpmIn = document.getElementById("wpmInput");

wpmIn.addEventListener('input', updateReadTime);

function updateReadTime(e) {
    // take num of words and divide speed
    var wpm = e.target.value;
    var words = [];
    var inputStr = document.getElementById("contentIn").value;
    words = inputStr.split(" ");

    var readTime = parseTime(words.length, wpm);

    document.getElementById("dispMins").innerHTML = readTime;
}


function parseTime(words, wpm) {
    var res;
    var hours, mins, seconds, addedMins;
    if(wpm == 0 || words == 0){
        hours = addedMins = 0;
    }
    else {
        mins = words / wpm;
        hours = Math.floor(mins/60);
        addedMins = Math.floor(mins % 60);
        seconds = Math.round((mins * 60 % 60) * 100) / 100;
    }
    if(hours < 1) {
        if(addedMins < 1){
            res = `${seconds} seconds`;
        } else {
            res = `${addedMins} minutes`;
        }
    } else {
        res = `${hours} hours ${addedMins} minutes`;
    }
    return res;
}
