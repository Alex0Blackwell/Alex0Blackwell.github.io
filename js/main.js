$.fn.moveIt = function(){
  var $window = $(window);
  var instances = [];

  $(this).each(function(){
    instances.push(new moveItItem($(this)));
  });

  window.addEventListener('scroll', function(){
    var scrollTop = $window.scrollTop();
    instances.forEach(function(inst){
      inst.update(scrollTop);
    });
  }, {passive: true});
}

var moveItItem = function(el){
  this.el = $(el);
  this.speed = parseInt(this.el.attr('data-scroll-speed'));
};

moveItItem.prototype.update = function(scrollTop){
  this.el.css('transform', 'translateY(' + -(scrollTop / this.speed) + 'px)');
};

$(function(){
  $('[data-scroll-speed]').moveIt();
});

var flag = true;
// function ee() {
//   var ref = document.getElementById('ee');
//
//   if (flag) { //currently compsci
//     // ref.innerHTML = `Alexandra`;
//     flag = false;
//   } else { //currently alexandra
//     // ref.innerHTML = "computer science";
//     flag = true;
//   }
// }

function ee() {
  for (var i = 0; i < 3; i++) {
    // document.getElementById('ee'+i).style.display = 'inline';
    document.getElementById('e'+i).style.display = 'none';
  }
  for (var j = 0; j < 6; j++) {
    document.getElementById('ee'+j).style.display = 'inline';
  }
}
function ee1() {
  for (var i = 0; i < 3; i++) {
    document.getElementById('e'+i).style.display = 'inline';
  }
  for (var j = 0; j < 6; j++) {
    document.getElementById('ee'+j).style.display = 'none';
  }
}
