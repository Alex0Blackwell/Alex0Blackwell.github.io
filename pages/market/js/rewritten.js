function lightGen() {
  var items = ['Wood', 'Brick', 'Steel', 'Silver', 'Gold',
              'Platinum', 'Cell Phone', 'Computer'];
  var rarity, index, numItems, price;

  // get rarity
  for (i = 0; i < items.length; i++) {
    rarity = Math.random() * 100;

    if (rarity < 25)
      index = 0;
    else if (rarity < 45)
      index = 1;
    else if (rarity < 65)
      index = 2;
    else if (rarity < 80)
      index = 3;
    else if (rarity < 87)
      index = 4;
    else if (rarity < 93)
      index = 5;
    else if (rarity < 97)
      index = 6;
    else if (rarity <= 100)
      index = 7;

    numItems = numOfItem(index);
    price = priceGen(index, true) * numItems;
    document.getElementById("mSlot"+index).innerHTML = `${numItems} ${items[index]} for $${price}`;
    document.getElementById("mSlot"+index).value = `${index}~light~${numItems}`;
  }
}

function largeGen() {
    var mBigItems = ['Electronics Store', 'Computer Store', 'Café', 'Restaurant'];
    var rarity, firstWord, index, price;
    var repeat = false;

    var el = document.getElementById("bMSlot0");

    do {
      rarity = Math.random() * 10;
      firstWord = el.innerHTML.replace("<strike>", '').split(' ')[0];

      if(rarity < 4) {
        if(firstWord == "Electronics")
          repeat = true;
        else {
          index = 0;
          repeat = false;
        }
      }
      else if(rarity < 7) {
        if(firstWord == "Computer")
          repeat = true;
        else {
          index = 1;
          repeat = false;
        }
      }
      else if(rarity < 9) {
        if(firstWord == "Café")
          repeat = true;
        else {
          index = 2;
          repeat = false;
        }
      } else {
        if(firstWord == "Restaurant")
          repeat = true;
        else {
          index = 3;
          repeat = false;
        }
      }

    } while (repeat);

    price = priceGen(index, false);
    el.innerHTML = `${mBigItems[index]} for $${price}`;
    document.getElementById("mSlot"+index).value = `${index}~large~1`;
  }

/* returns the price for one item of the given type */
function priceGen(index, light) {
  var res, offset, id, thisItem;
  var lightPrice = [10, 15, 25, 50, 100, 150, 1000, 1500];
  var largePrice = [10000, 20000, 25000, 75000];

  if(light) {
    offset = (lightPrice[index] / (Math.random() + 0.1)) * 0.09;
    thisItem = lightPrice[index];
    id = "mSlot"+index;
  } else {
    offset = (largePrice[index] / (Math.random() + 0.1)) * 0.09;
    thisItem = largePrice[index];
    id = "bMSlot0";
  }

  if(Math.random() > 0.5) {
    // add price => bad deal
    res = thisItem + offset;
  } else {
    // subtract price => good deal => bot buy
    res = thisItem - offset;
    setTimeout(buy, (res / thisItem * 10000), true, id); //parameter for referencing the item
  }
  res = Math.floor(res);
  return res;
}

function marketTime() {
  var lightTime = 15000;
  var largeTime = 75000;
  var rawTimeLight = lightTime / 1000;
  var rawTimeLarge = largeTime / 1000;

  var lightCD = document.getElementById('mRefreshT');
  lightCD.innerHTML = `${lightTime/1000} seconds`;
  setInterval(function() {
    rawTimeLight--;
    if (rawTimeLight === 0) {
      rawTimeLight = lightTime / 1000;
      largeGen();
    }
    lightCD.innerHTML = `${rawTimeLight} seconds`;
  }, 1000);

  var heavyCD = document.getElementById('mBRefreshT');
  heavyCD.innerHTML = "1 minute 15 seconds";
  setInterval(function() {
    rawTimeLarge--;
    var m = Math.floor(rawTimeLarge / 60);
    var s = rawTimeLarge % 60;
    var res = "";

    if (m != 0) {
      res += `${m} minute`;
    }
    res += ` ${s} seconds`;
    if (rawTimeLarge === 0) {
      largeGen();
      rawTimeLarge = largeTime / 1000;
      res = "1 minute 15 seconds"
    }
    document.getElementById('mBRefreshT').innerHTML = res;
  }, 1000);
}

function numOfItem(index) {
  var res = Math.random();

  if(index < 4)
    res *= 10;
  else if(index < 6)
    res *= 5;
  else
    res *= 3;

  res = res.toFixed();
  return res;
}

function buy(bot, id) {
  console.log(id);
  var boughtItem;
  var el = document.getElementById(id);
  if(bot) {
    var content = el.innerHTML.strike();
    el.innerHTML = content;
    el.value = false;
  } else {
    var value = el.value;
    if(value) {
      var moneyBool = money(parseInt(value.split('~')[2]));
      // var moneyRewrite = parseInt(moneyBool[0]);
      // localStorage.setItem('moneySave', moneyRewrite);
      if (moneyBool[1]) {
        boughtItem = value;
        var data = el.innerHTML;
        var res = data.fontcolor("#49c460").strike();
        el.innerHTML = res;
        el.value = false;
      }
    } else {
      var alert = document.getElementById("alert-alreadyBought");
      alert.style.display = "block";
      setTimeout(function(){
        $("#alert-alreadyBought").fadeOut();
      }, 2000);
    }
  document.getElementById("inventory").innerHTML = inventory(boughtItem);
  document.getElementById("moneyP").innerHTML = `Money: $${localStorage.moneySave}`;
  myMarket();
  }
}

/* for adding or removing items from the user's inventory */
function inventory(item) {
  var res = [];
  var allItemSave = [[localStorage.woodSave, "Wood"], [localStorage.brickSave, "Brick"],
  [localStorage.steelSave, "Steel"], [localStorage.silverSave, "Silver"], [localStorage.goldSave, "Gold"],
  [localStorage.platinumSave, "Platinum"], [localStorage.cellPhoneSave, "Cell Phone"],
  [localStorage.computerSave, "Computer"], [localStorage.electronicsStoreSave, "Electronics Store"],
  [localStorage.computerStoreSave, "Computer Store"], [localStorage.cafeSave, "Café"],
  [localStorage.restaurantSave, "Restaurant"]];

  if(item) {
    var itemInfo = item.split('~');
    var index = itemInfo[0];
    var lightORlarge = itemInfo[1];
    var amount = itemInfo[2];

    if(lightORlarge == "large")
    index += 8;  // using this array

    allItemSave[index][0] += amount;
  }

  for(var i = 0; i < allItemSave.length; i++) {
    if(allItemSave[i][0] != 0) {
      res += (`${allItemSave[i][0]} ${allItemSave[i][1]}`);
    }
  }

  return res;
}

function money(price) {
  var money = localStorage.moneySave;
  var canBuy = false;

  if (money - price >= 0) {
    money -= price;
    canBuy = true;
    //localStorage.setItem('moneySave', money);

    var el = document.getElementById("alert-bought");
    el.style.display = "block";
    setTimeout(function() {
      $("#alert-bought").fadeOut();
    }, 2000);
  } else {
    var el = document.getElementById("alert-money");
    el.style.display = "block";
    setTimeout(function(){
      document.getElementById("alert-money").fadeOut();
    }, 2000);
  }

  return money;

}

function myMarket() {
  var itemArr = inventory(false);
  var parent = document.getElementById("container");
  var maxQuant = [];

  while (parent.hasChildNodes()) { //deletes anything currently in the users "add to market"
    parent.removeChild(parent.firstChild);
  }

  for (var i = 0; i < itemArr.length; i++) {
    maxQuant.push(parseInt(itemArr[i].split(' ')[0]));
  }

  for (var i = 0; i < itemArr.length; i++) { // loop that dynamically generates html via javascript and gives these elements unique id's
    var newDiv = document.createElement('div');
    newDiv.className = "gridItem col-lg col-sm-4 col-6 col-xs-12";

    var amountType = document.createElement('p');
    amountType.innerText = `${itemArr[i].split(' ')[0]}/${maxQuant[i]} ${itemArr[i].replace(/[0-9]|\/|/g, '').trim()}`;
    amountType.setAttribute('id', 'typeID' + i);
    amountType.setAttribute('class', "dt");

    var up = document.createElement('p');
    up.innerText = '▲';
    up.setAttribute('id', 'upID~' + i);
    up.setAttribute('class', "clickable dt");

    var down = document.createElement('p');
    down.innerText = '▼';
    down.setAttribute('id', 'downID~' + i);
    down.setAttribute('class', "clickable dt");

    var input = document.createElement('input');
    input.type = 'number';
    input.setAttribute('id', 'input~' + i);
    amountType.setAttribute('class', "dt");
    //input.value = itemType(itemArr[i].replace(/[0-9]|\/|/g, '').trim())*itemArr[i].split(' ')[0];

    var confirm = document.createElement('button');
    confirm.innerText = 'Advertise';
    confirm.setAttribute('id', 'confirm~' + i);
    confirm.setAttribute('class', "confirmBtn");

    newDiv.appendChild(up);
    newDiv.appendChild(amountType);
    newDiv.appendChild(down);
    newDiv.appendChild(input);
    newDiv.appendChild(confirm);
    document.getElementById('container').appendChild(newDiv);
  }


  for (var c = 0; c < itemArr.length; c++) { //a simular for loop is needed to reference different id's to add listeners
      document.getElementById('upID~' + c).addEventListener('click', function() { //up button to increment quantity by + 1
      var itemOrderNum0 = parseInt(this.id.split('~')[1]);
      var amountOrig = parseInt(itemArr[itemOrderNum0].split(' ')[0]);

      if (amountOrig < maxQuant[itemOrderNum0]) {
        itemArr[itemOrderNum0] = `${amountOrig+1}/${maxQuant[itemOrderNum0]} ${itemArr[itemOrderNum0].replace(/[0-9]|\/|/g, '').trim()}`;
        document.getElementById('input~' + itemOrderNum0).value = itemType(itemArr[itemOrderNum0].replace(/[0-9]|\/|/g, '').trim())*(amountOrig+1);
      } else {
        itemArr[itemOrderNum0] = `${amountOrig}/${maxQuant[itemOrderNum0]} ${itemArr[itemOrderNum0].replace(/[0-9]|\/|/g, '').trim()}`;
        document.getElementById('input~' + itemOrderNum0).value = itemType(itemArr[itemOrderNum0].replace(/[0-9]|\/|/g, '').trim())*amountOrig;
      }
      document.getElementById('typeID' + itemOrderNum0).innerHTML = itemArr[itemOrderNum0];
    })

    document.getElementById('downID~' + c).addEventListener('click', function() { //down button to increment quantity by - 1
      var itemOrderNum1 = parseInt(this.id.split('~')[1]);
      var amountOrig1 = parseInt(itemArr[itemOrderNum1].split(' ')[0]);

      if (amountOrig1 > 1) {
        itemArr[itemOrderNum1] = `${amountOrig1-1}/${maxQuant[itemOrderNum1]} ${itemArr[itemOrderNum1].replace(/[0-9]|\/|/g, '').trim()}`;
        document.getElementById('input~' + itemOrderNum1).value = itemType(itemArr[itemOrderNum1].replace(/[0-9]|\/|/g, '').trim())*(amountOrig1 - 1);
      } else {
        itemArr[itemOrderNum1] = `${amountOrig1}/${maxQuant[itemOrderNum1]} ${itemArr[itemOrderNum1].replace(/[0-9]|\/|/g, '').trim()}`;
        document.getElementById('input~' + itemOrderNum1).value = itemType(itemArr[itemOrderNum1].replace(/[0-9]|\/|/g, '').trim())*(amountOrig1);
      }
      document.getElementById('typeID' + itemOrderNum1).innerHTML = itemArr[itemOrderNum1];
    })

    document.getElementById('confirm~' + c).addEventListener('click', function() { //advertise button to put on the users live market
      var itemOrderNum0 = parseInt(this.id.split('~')[1]);
      var value = document.getElementById('input~' + itemOrderNum0).value;
      var div = document.getElementById("myLiveItems");
      var nodeList = div.getElementsByTagName("div").length;

      if (value < 0) {
        document.getElementById('input~' + itemOrderNum0).value = 0;
      } else if (nodeList < 6) {
        if(nodeList == 4) {
          var el = document.getElementById("alert-oneMoreSlot");
          el.style.display = "block";
          setTimeout(function(){
            document.getElementById("alert-oneMoreSlot").fadeOut();
          }, 2000);
        }
        var allItems = ['Wood', 'Brick', 'Steel', 'Silver', 'Gold',
                        'Platinum', 'Cell Phone', 'Computer','Electronics Store',
                        'Computer Store', 'Café', 'Restaurant'];

        var el = document.getElementById("typeID"+itemOrderNum0).innerHTML;
        var itemType = el.replace(/[0-9]|\/|/g, '').trim();
        var amount = parseInt(el.split('/')[0]);
        var index = 0;
        var lightORlarge = "light";
        var key;

        while(allItems[index] != itemType) {
          index++;
        }
        if(index > 7)
          lightORlarge = "large";

        key = `${index}~${lightORlarge}~${-1*amount}`;  // negative amount
        money(key);  // subtracts the amount of the item type
        addToMyMarket(itemOrderNum0);




        myMarket();  // refresh what is displayed in my market
        document.getElementById("inventory").innerHTML = inventory(false);
      } else {
        var el = document.getElementById("alert-notEnoughSlots");
        el.style.display = "block";
        setTimeout(function(){
          $("#alert-notEnoughSlots").fadeOut();
        }, 2000);
      }
    })
  }
}

function addToMyMarket(index) {
  var div = document.getElementById("myLiveItems");
  var nodeList = div.getElementsByTagName("div").length;
  var amount = document.getElementById('typeID' + index).innerHTML.split('/')[0];

  var newDiv = document.createElement('div');
  newDiv.className = 'gridItem col-lg col-sm-3 col-6';

  var newItem = document.createElement('p');
  newItem.innerText = `${amount} ${type}`;
  newItem.setAttribute('id', 'MMhost' + nodeList);
  newItem.setAttribute('class', "dt");

  var itemPrice = document.createElement('p');
  itemPrice.innerText = `$${price}`;
  itemPrice.setAttribute('id', 'itemPrice' + nodeList);
  itemPrice.setAttribute('class', "dt");

  var deleteBtn = document.createElement('button');
  deleteBtn.innerText = 'delete';
  deleteBtn.onclick = function() {newDiv.remove();}

  newDiv.appendChild(newItem);
  newDiv.appendChild(itemPrice);
  newDiv.appendChild(deleteBtn);
  document.getElementById('myLiveItems').appendChild(newDiv);

  var ratio = price / (itemType(type)*amount);
  if(!(Math.random()+ratio-1.5 > 1)) {  // over 1.5 * the pricing it might not sell at all
    // if priced at average, will take about 60 secs
    var buyTime = (40*Math.pow(ratio, 2)+20 + Math.random()*10)*1000;
    setTimeout(botBuyMM, buyTime, nodeList, newDiv);
    setTimeout(function(){
      var el = document.getElementById("alert-sold");
      el.style.display = "block";
      setTimeout(function(){
        $("#alert-sold").fadeOut();
      }, 2000);
    }, buyTime);
  }
}

function buyMyMarket(index, deleteSlot) {
  var content = document.getElementById('MMhost' + index).innerHTML.strike();
  document.getElementById('MMhost' + index).innerHTML = content;
  setTimeout(function(){
    localStorage.moneySave = parseInt(document.getElementById('itemPrice' + index).innerHTML.replace('$','')) + Number(localStorage.moneySave);
    document.getElementById('moneyP').innerHTML = `Money: $${localStorage.moneySave}`;
    deleteSlot.remove();
  }, 2000);
}

function main() {
  //The below are variables stored in local storage so the users progress can be saved after closing or refreshing
  if(!localStorage.moneySave) {
    localStorage.moneySave = 1500;
    localStorage.woodSave = 0;
    localStorage.brickSave = 0;
    localStorage.steelSave = 0;
    localStorage.silverSave = 0;
    localStorage.goldSave = 0;
    localStorage.platinumSave = 0;
    localStorage.cellPhoneSave = 0;
    localStorage.computerSave = 0;
    localStorage.electronicsStoreSave = 0;
    localStorage.computerStoreSave = 0;
    localStorage.cafeSave = 0;
    localStorage.restaurantSave = 0;

    // and we want to show the tutorial
    document.getElementById("tutorial").style.display = "block";
    document.getElementById("game").style.display = "none";

    $(document).ready(function(){
      $("#tut0").fadeIn(1000);
      $("#tut1").fadeIn(2000);
      $("#tut2").fadeIn(3000);
    });

  }

  marketTime(); // start timers
  lightGen(); // generate light market items
  largeGen(); // generate large market items
  myMarket(); // if the user has items in their market they will display
  document.getElementById("inventory").innerHTML = inventory();  // display inventory
  document.getElementById("moneyP").innerHTML = `Money: $${localStorage.moneySave}`; // display money

}

main();
