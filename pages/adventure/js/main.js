var disp = document.getElementById('disp');
var one = document.getElementById('one');
var two = document.getElementById('two');
var back = document.getElementById('back');

var aFlag = false;

disp.value = 0 + 'a';

oneClick();

function oneClick() {
  back.style.display = 'none';
  one.style.display = 'inline';
  two.style.display = 'inline';

  switch (disp.value) {
    case '0a':
      disp.innerHTML = sceneOne.disp;
      one.innerHTML = sceneOne.choices[0];
      two.innerHTML = sceneOne.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      break;
    case '1a':
      disp.innerHTML = sceneOne.one.disp;
      one.innerHTML = sceneOne.one.choices[0];
      two.innerHTML = sceneOne.one.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      break;
    case '2a':
      disp.innerHTML = sceneTwo.disp;
      one.innerHTML = sceneTwo.choices[0];
      two.innerHTML = sceneTwo.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      break;
    case '3a':
      one.disabled = false;
      disp.innerHTML = sceneThree.disp;
      one.innerHTML = sceneThree.choices[0];
      two.innerHTML = sceneThree.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'b';
      break;
    case '3b':
      disp.innerHTML = sceneOne.one.two.one.disp;
      one.style.display = 'none';
      two.style.display = 'none';
      point('1a', 'Back out of there', true);
      break;
    case '4b':
      disp.innerHTML = sceneThree.one.disp;
      one.innerHTML = sceneThree.one.choices[0];
      one.disabled = true;
      two.style.display = 'none';
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      point('3a', 'Back', true);
      break;
    case '4c':
      disp.innerHTML = sceneTwo.two.final;
      one.style.display = 'none';
      two.style.display = 'none';
      point('2a', 'Back', true);
      break;
    case '5a':
      disp.innerHTML = sceneThree.two.one.disp;
      one.innerHTML = sceneThree.two.one.choices[0]; //note this is the ambulance
      two.innerHTML = sceneThree.two.one.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      break;
    case '6a':
      disp.innerHTML = sceneFour.disp;
      one.innerHTML = sceneFour.choices[0];
      two.innerHTML = sceneFour.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      aFlag = true;
      break;
    case '7a':
      disp.innerHTML = sceneFour.one.disp;
      one.innerHTML = sceneFour.one.choices[0];
      two.innerHTML = sceneFour.one.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      break;
    case '8a':
      one.disabled = false;
      two.disabled = false;
        if (aFlag) {
          disp.innerHTML = sceneFive.ambul.disp;
          one.innerHTML = sceneFive.ambul.choices[0];
          two.style.display = 'none';
          aFlag = false;
          disp.value = '8a';
        } else {
            disp.innerHTML = sceneFive.disp;
            two.style.display = 'none';
            one.style.display = 'none';
            disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
            point('10a', 'Next', true);
        }
      break;
    case '10a':
      disp.innerHTML = sceneSix.disp;
      one.innerHTML = sceneSix.choices[0];
      two.innerHTML = sceneSix.choices[1];
      disp.value = (parseInt(disp.value.substring(0, 2))+1) + 'a';
      break;
    case '11a':
      one.disabled = false;
      two.disabled = false;
      disp.innerHTML = sceneSeven.disp;
      one.innerHTML = sceneSeven.choices[0];
      two.innerHTML = sceneSeven.choices[1];
      disp.value = (parseInt(disp.value.substring(0, 2))+1) + 'b';
      break;
    case '12b':
      disp.innerHTML = sceneSeven.one.disp;
      one.innerHTML = sceneSeven.one.choices[0];
      two.style.display = 'none';
      disp.value = (parseInt(disp.value.substring(0, 2))+1) + 'a';
      break;
    case '13a':
      disp.innerHTML = sceneSeven.one.final;
      one.style.display = 'none';
      two.style.display = 'none';
      disp.value = (parseInt(disp.value.substring(0, 2))+1) + 'a';
      point('13a', 'Next');
      break;
  }
}
//------------------------------------------------------------------------------
function twoClick() {
  back.style.display = 'none';
  one.style.display = 'inline';
  two.style.display = 'inline';

  switch (disp.value) {
    case '0a':
      disp.innerHTML = sceneOne.disp;
      one.innerHTML = sceneOne.choices[0];
      two.innerHTML = sceneOne.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      break;
    case '1a':
      disp.innerHTML = sceneOne.two.disp;
      one.style.display = 'none';
      two.style.display = 'none';
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      point('0a', 'Back', true);
      break;
    case '2a':
      disp.innerHTML = sceneOne.one.two.disp;
      one.innerHTML = sceneOne.one.two.choices[0];
      two.innerHTML = sceneOne.one.two.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'b';
      break;
    case '3a':
      disp.innerHTML = sceneTwo.two.disp;
      one.innerHTML = sceneTwo.two.choices[0];
      two.innerHTML = sceneTwo.two.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'c';
      break;
    case '3b':
      disp.innerHTML = sceneOne.one.two.two.disp;
      one.style.display = 'none';
      two.style.display = 'none';
      point('1a', 'Back', true);
      break;
    case '4c':
      disp.innerHTML = sceneTwo.two.final;
      one.style.display = 'none';
      two.style.display = 'none';
      point('2a', 'Back', true);
      break;
    case '4a':
      disp.innerHTML = sceneTwo.two.disp;
      one.innerHTML = sceneTwo.two.choices[0];
      two.innerHTML = sceneTwo.two.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      break;
    case '4b':
      disp.innerHTML = sceneThree.two.disp;
      one.innerHTML = sceneThree.two.choices[0];
      two.innerHTML = sceneThree.two.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      break;
    case '5a':
      disp.innerHTML = sceneThree.two.two.disp;
      one.style.display = 'none';
      two.style.display = 'none';
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      point('4b', 'Back');
      break;
    case '6a':
      disp.innerHTML = sceneFour.disp;
      one.innerHTML = sceneFour.choices[0];
      two.innerHTML = sceneFour.choices[1];
      disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
      break;
    case '7a':
      disp.innerHTML = sceneFive.disp;
        if (aFlag) {
          disp.innerHTML = sceneFive.ambul.disp;
          one.innerHTML = sceneFive.ambul.choices[0];
          two.style.display = 'none';
          aFlag = false;
          disp.value = '8a';
        } else {
            one.style.display = 'none';
            two.style.display = 'none';
            disp.value = (parseInt(disp.value.charAt(0))+1) + 'a';
            point('10a', 'Next', true);
        }
      break;
    case '8a':
      disp.innerHTML = sceneFour.one.two.disp;
      one.style.display = 'none';
      two.style.display = 'none';
      point('8a', 'Jump through time like Jack', true);
      break;
    case '11a':
      one.disabled = true;
      two.disabled = true;
      disp.innerHTML = sceneSix.two.disp;
      one.innerHTML = sceneSix.two.choices[0];
      two.innerHTML = sceneSix.two.choices[1];
      disp.value = (parseInt(disp.value.substring(0, 2))+1) + 'a';
      point('11a', 'Next', true);
      break;
    case '12a':
      disp.innerHTML = sceneSix.two.disp;
      one.innerHTML = sceneSix.two.choices[0];
      two.innerHTML = sceneSix.two.choices[1];
      disp.value = (parseInt(disp.value.substring(0, 2))+1) + 'a';
      point('11a', 'Next', true);
      break;
    case '12b':
      disp.value = '13a';
      twoClick();
      break;
    case '13a':
      disp.innerHTML = sceneSeven.two.disp;
      one.style.display = 'none';
      two.innerHTML = sceneSeven.two.next;
      disp.value = (parseInt(disp.value.substring(0, 2))+1) + 'a';
      break;
    case '14a':
      disp.innerHTML = sceneSeven.two.final;
      one.style.display = 'none';
      two.style.display = 'none';
      break;
  }
}

function point(place, text, path) {
  back.innerHTML = text;
  back.style.display = 'inline';
  back.addEventListener('click', function() {
    disp.value = place;
    if (path) {oneClick();} else {twoClick();}
  });
}
