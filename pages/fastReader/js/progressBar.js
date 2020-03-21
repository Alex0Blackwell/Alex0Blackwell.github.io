var i = 0;
var id;
var width = 1;
function move(stopFlag) {
    if(stopFlag) {
        clearInterval(id);
    } else {
      var elem = document.getElementById("bar");
      var rate = getRate();
      console.log("rate is ", rate);
      id = setInterval(frame, rate);
        function frame() {
            if (width >= 100) {
              clearInterval(id);
              width = 0;
              elem.style.width = 1 + "%";
            } else {
              width++;
              elem.style.width = width + "%";
            }
        }
    }
}

function getRate() {
    // get number of words
    var words = [];
    var inputStr = document.getElementById("contentIn").value;
    words = inputStr.split(" ");
    var numOfWords = words.length;
    // get wpm
    var wpm = document.getElementById("wpmInput").value;
    // make this a usable rate
    return numOfWords / wpm * 60 * 10
}
