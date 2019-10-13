//dims are 750, 750

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.fillStyle = "#abe1f2";
ctx.fillRect(0, 0, 750, 750);


darkBlue();

greenUnderlay();

darkGreen();
ctx.fillStyle = "#238726";


function darkBlue() {
  for (var i = 0; i < Math.random()*7; i++) {
    ctx.beginPath();
    ctx.rect(200 + Math.random()*10, 200 + Math.random()*10, 400 - Math.random()*200, 400 - Math.random()*200);
    ctx.fillStyle = `rgb(${100 - Math.random()*100}, ${180 - Math.random()*80}, 255)`;
    ctx.fill();
  }
}

function greenUnderlay() {
  for (var i = 0; i < Math.random()*4; i++) {
    ctx.beginPath();
    ctx.rect(320 + Math.random()*10, 320 + Math.random()*10, Math.random()*200, Math.random()*200);
    ctx.fillStyle = "#238726";
    ctx.fill();
  }
}

function darkGreen() {
  for (var i = 0; i < Math.random()*4; i++) {
    ctx.beginPath();
    ctx.rect(320 + Math.random()*10, 320 + Math.random()*10, Math.random()*100, Math.random()*100);
    ctx.fillStyle = "#0f3f11";
    ctx.fill();
  }
}

var placedCords = [];
lightGreen();
function lightGreen() {

  for (var i = 0; i < 15; i++) {
    var xpos = Math.floor(Math.random()*500 / 10) *10 +120;
    var ypos = Math.floor(Math.random()*500 / 10) *10 +120;

    placedCords.push(`${xpos} ${ypos}`);
    drawPixel(xpos, ypos);
  }

  //need cases for:
  //up-left, down-left, up-right, down-right
  //make function for growing back to origin
  for (var j = 0; j < placedCords.length; j++) {
    var x = parseInt(placedCords[j].split(" ")[0]);
    var y = parseInt(placedCords[j].split(" ")[1]);
    expandToBase(x, y);
    }
}

function expandToBase(x, y) {
  var storeX = x;
  var storeY = y;
  for (var i = 1; i < 10; i++) {
    if (x < 375) {
      if (y > 375) { //bottom left
        for (var j = 0; j < 10; j++) {
          x = x+10;
          y = y-10;
          drawPixel(x, y, "#238726");
          if (Math.random()*j > 3) {
            drawPixel(x, y, "#0f3f11");
          }
        }
        x = storeX + 20*i;
        y = storeY - 10*i;
        drawPixel(x, y, "#abe1f2");
      }
      else { //top left
        for (var j = 0; j < 10; j++) {
          x = x+10;
          y = y+10;
          drawPixel(x, y, "#238726");
          if (Math.random()*j > 3) {
            drawPixel(x, y, "#0f3f11");
          }
        }
        x = storeX + 20*i;
        y = storeY + 10*i;
        drawPixel(x, y, "#abe1f2");
      }
    } else {
      //x = x-10;
      if (y > 375) { //bottom right
        // y = y-10;
        // drawPixel(x, y);
        for (var j = 0; j < 10; j++) {
          x = x-10;
          y = y-10;
          drawPixel(x, y, "#238726");
          if (Math.random()*j > 3) {
            drawPixel(x, y, "#0f3f11");
          }
        }
        x = storeX - 20*i;
        y = storeY - 10*i;
        drawPixel(x, y, "#abe1f2");
      } else { //top right

        for (var j = 0; j < 10; j++) {
          x = x-10;
          y = y+10;
          drawPixel(x, y, "#238726");
          if (Math.random()*j > 3) {
            drawPixel(x, y, "#0f3f11");
          }
        }
        x = storeX - 20*i;
        y = storeY + 10*i;
        drawPixel(x, y, "#abe1f2");
      }
    }
  }
}

function round() {

}

//if true, then draw
function prefilled(x, y) {
  var compare = `${x} ${y}`;
  for (var i = 0; i < placedCords.length; i++) {
    if (placedCords[i] === compare) {
      return false;
    }
  }
  return true;
}

function drawPixel(x ,y , c) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.rect(x, y, 10, 10);
  ctx.fill();
}

// //drawing horizontal lines
// for (var a = 0; a <= 750; a = a+10) {
//   ctx.moveTo(0, a);
//   ctx.lineTo(750, a);
//   ctx.stroke();
// }
//
// //drawing verticle lines
// for (var b = 0; b <= 750; b = b+10) {
//   ctx.moveTo(b, 0);
//   ctx.lineTo(b, 750);
//   ctx.stroke();
// }
