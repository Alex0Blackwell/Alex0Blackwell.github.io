function toggleDateEE() {
  var dateTitle = document.getElementById("dateTitle");
  var date = document.getElementById("date");

  if(dateTitle.innerHTML == "Date") {
    dateTitle.innerHTML = "Dating";
    date.innerHTML = "Annika";
  } else {
    dateTitle.innerHTML = "Date";
    date.innerHTML = "November 2020";
  }
}

$(window).on("load",function(){
     $(".loader-wrapper").fadeOut("slow");
});
