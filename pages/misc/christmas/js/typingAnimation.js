function typeEffect(element, speed) {
  return new Promise(resolve => {
    var text = element.innerHTML;
    element.innerHTML = "";

    var i = 0;
    var timer = setInterval(function() {
      if (i < text.length) {
        element.append(text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    setTimeout(() => {
      resolve("resolved");
    }, text.length * speed + 750);  // 750 ms delay

  });
}


async function animatePrompt(twoAnswers, isEnd) {
  // application
  var prompt = document.getElementById("prompt");
  var left = document.getElementById("left");
  var right = document.getElementById("right");

  // Change back to 50
  var speed = 50;
  var delay = prompt.innerHTML.length * speed + speed;

  // type affect to header
  await typeEffect(prompt, speed);


  // fade in
  if(!isEnd)
    $("#left-container").fadeIn();
  if(twoAnswers)
    $("#right-container").fadeIn();
  $("#backBtn").fadeIn();
}
