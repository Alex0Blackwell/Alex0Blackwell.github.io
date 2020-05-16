
/* for counting down and calling the market generation. void */
function marketTime() {
  var t0 = 15000;
  var t1 = 75000;
  var rawTime0 = t0 / 1000;
  var rawTime1 = t1 / 1000;

  var lightCD = document.getElementById('mRefreshT');
  lightCD.innerHTML = `${t0/1000} seconds`;
  setInterval(function() {
    rawTime0--;
    if (rawTime0 === 0) {
      rawTime0 = t0 / 1000;
      mSlotGen();
    }
    lightCD.innerHTML = `${rawTime0} seconds`;
  }, 1000);

  var heavyCD = document.getElementById('mBRefreshT');
  heavyCD.innerHTML = "1 minute 15 seconds";
  setInterval(function() {
    rawTime1--;
    var m = Math.floor(rawTime1 / 60);
    var s = rawTime1 % 60;
    var res = "";

    if (m != 0) {
      res += `${m} minute`;
    }
    res += ` ${s} seconds`;
    if (rawTime1 === 0) {
      mSlotGenBig();
      rawTime1 = t1 / 1000;
      res = "1 minute 15 seconds"
    }

    document.getElementById('mBRefreshT').innerHTML = res;
  }, 1000);
}

/* Generates large market items.
 * Does not generate the same item as there was previously.
  * void, calls mBigPriceGen to get the price */
function mSlotGenBig() {
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


  price = mBigPriceGen(index);
  el.innerHTML = `${mBigItems[index]} for $${price}`;
  el.value = `1~${mBigItems[index]}~${price}`;
}

/* for generating light market slot items.
 * void. Calls mPriceGen() to get the price */
function mSlotGen() {
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
   price = mPriceGen(index, numItems, i);
   document.getElementById("mSlot"+i).innerHTML = `${numItems} ${items[index]} for $${price}`;
   document.getElementById("mSlot"+i).value = `${numItems}~${items[index]}~${price}`;
 }
}

/* returns the light market price, sets a timer to buy the items */
function mPriceGen(index, amount, i) {
  var mItemPrice = [10, 15, 25, 50, 100, 150, 1000, 1500];
  if (Math.random()>.5) {
    return ((mItemPrice[index] + (mItemPrice[index] / (Math.random() + 0.1)) * 0.09).toFixed()) * amount;
  } else {
    var rawPrice = (mItemPrice[index] - (mItemPrice[index] / (Math.random() + 0.1)) * 0.09).toFixed();
    setTimeout(botBuy, (rawPrice / mItemPrice[index] * 10000),'mSlot', i); //parameter for referencing the item
    return (rawPrice * amount);
  }
}

/* returns the large market price, sets a timer to buy the items */
function mBigPriceGen(index) {
  var mItemPrice = [10000, 20000, 25000, 75000];

  if (Math.random()>.5) {
    return ((mItemPrice[index] + (mItemPrice[index] * 0.9 / (Math.random() + 0.1)) / 10).toFixed());
  } else {
    var rawPrice1 = (mItemPrice[index] - (mItemPrice[index] * 0.9 / (Math.random() + 0.1)) / 10).toFixed();
    setTimeout(botBuy, (rawPrice1 / mItemPrice[index] * 10000), 'bMSlot', 0);
    return rawPrice1
  }
}

/* returns the number of items that will spawn
 * so cheaper items spawn in greater quantities */
function numOfItem(a) {
  if (a < 4) {
    return (Math.random() * 9 + 1).toFixed();
  } else if (a < 6) {
    return (Math.random() * 4 + 1).toFixed();
  } else {
    return (Math.random() * 2 + 1).toFixed();
  }
}

/* for when a bot buys an item it crosses it out
 * and makes it impossible to buy. void */
function botBuy(id, index) {
  var content = document.getElementById(id + index).innerHTML.strike();
  document.getElementById(id + index).innerHTML = content;
  document.getElementById(id + index).value = false;
}

/* when buying items, makes sure the item can't be bought again,
 * crosses it out, subtract the item price from the users money,
 * and adds the items to the inventory
 * calls moneyFn(), invenCopy(), and myMarket(). void */
function buy(id, index) {
    var content = document.getElementById(id + index).value;
    if (content) {
      var moneyBool = moneyFn(parseInt(content.split('~')[2]));
      var moneyRewrite = parseInt(moneyBool[0]);
      localStorage.setItem('moneySave', moneyRewrite);
      if (moneyBool[1]) {
        var data = document.getElementById(id + index).innerHTML;
        var res = data.fontcolor("#49c460").strike();
        document.getElementById(id + index).innerHTML = res;
        document.getElementById(id + index).value = false;
      }
    } else {
      var el = document.getElementById("alert-alreadyBought");
      el.style.display = "block";
      setTimeout(function(){
        $("#alert-alreadyBought").fadeOut();
      }, 2000);
    }
  document.getElementById('inventory').innerHTML = invenCopy(content);
  document.getElementById('moneyP').innerHTML = `Money: $${localStorage.moneySave}`;
  myMarket();
}

/* adds all the repeating items together and organizes them from cheapest to
 * most expensive, displaying only the items that have a quantity greater than 0
 * calls itemType(). Returns an array of all your items with amount > 0 */
function invenCopy(boughtItem) {
  var finalInven = [];

  if(boughtItem) {
    itemType(boughtItem.split('~')[1], parseInt(boughtItem.split('~')[0]));
  }
  var amountArr = [`${localStorage.woodSave} Wood`, `${localStorage.brickSave} Brick`, `${localStorage.steelSave} Steel`, `${localStorage.silverSave} Silver`, `${localStorage.goldSave} Gold`, `${localStorage.platinumSave} Platinum`, `${localStorage.cellPhoneSave} Cell Phone`, `${localStorage.computerSave} Computer`, `${localStorage.electronicsStoreSave} Electronics Store`, `${localStorage.computerStoreSave} Computer Store`, `${localStorage.cafeSave} Cafe`, `${localStorage.restaurantSave} Restaurant`];
  for (var a = 0; a < amountArr.length; a++) {
    if (parseInt(amountArr[a].slice(0, 1)) > 0) {
      finalInven.push(amountArr[a]);
    }
  }
  return finalInven;
}

/* subtracts price if user money doesn't go negative.
 * Returns [money, flag] where flag is true if the item could be bought */
function moneyFn(price) {
  var money = parseInt(localStorage.moneySave);
  if (money - price >= 0) {
    localStorage.moneySave = Number(localStorage.moneySave) - price;
    var el = document.getElementById("alert-bought");
    el.style.display = "block";
    setTimeout(function(){
      $("#alert-bought").fadeOut();
    }, 2000);
    return [localStorage.moneySave, true];
  }
  var el = document.getElementById("alert-money");
  el.style.display = "block";
  setTimeout(function(){
    $("#alert-money").fadeOut();
  }, 2000);
  return [localStorage.moneySave, false];
}

/* for everything about the users market: adding items to the users live market,
 * selecting the amount of items to add, selecting the price of the items,
 * the option to delete live items.
 * Calls myMarket(). void. Actual nightmare, disaster to code. black magic. stay away */
function myMarket() {
  var itemArr = invenCopy(false);
  var maxQuant = []; //used so you can't add more items than you have to your market
  var parent = document.getElementById('container');

  while (parent.hasChildNodes()) { //deletes anything currently in the users "add to market"
    parent.removeChild(parent.firstChild);
  }

  if (maxQuant.length === 0) { //sets maxQuant if not already
    for (var a = 0; a < itemArr.length; a++) {
      maxQuant.push(parseInt(itemArr[a].split(' ')[0]));
    }
  }

  for (var b = 0; b < itemArr.length; b++) { //loop that dynamically generates html via javascript and gives these elements unique id's
    var newDiv = document.createElement('div');
    newDiv.className = "gridItem col-lg col-sm-4 col-6 col-xs-12";

    var amountType = document.createElement('p');
    amountType.innerText = `${itemArr[b].split(' ')[0]}/${maxQuant[b]} ${itemArr[b].replace(/[0-9]|\/|/g, '').trim()}`;
    amountType.setAttribute('id', 'typeID' + b);
    amountType.setAttribute('class', "dt");

    var up = document.createElement('p');
    up.innerText = '▲';
    up.setAttribute('id', 'upID~' + b);
    up.setAttribute('class', "clickable dt");

    var down = document.createElement('p');
    down.innerText = '▼';
    down.setAttribute('id', 'downID~' + b);
    down.setAttribute('class', "clickable dt");

    var input = document.createElement('input');
    input.type = 'number';
    input.setAttribute('id', 'input~' + b);
    amountType.setAttribute('class', "dt");
    input.value = itemType(itemArr[b].replace(/[0-9]|\/|/g, '').trim())*itemArr[b].split(' ')[0];

    var confirm = document.createElement('button');
    confirm.innerText = 'Advertise';
    confirm.setAttribute('id', 'confirm~' + b);
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
            $("#alert-oneMoreSlot").fadeOut();
          }, 2000);
        }
        var type = document.getElementById('typeID' + itemOrderNum0).innerHTML;
        switch (type.replace(/[0-9]|\/|/g, '').trim()) {
          case 'Wood':
            hostAppend(itemOrderNum0, type, 'Wood', value);
            localStorage.woodSave = Number(localStorage.woodSave) - parseInt(type.split('/')[0]);
            break;
          case 'Brick':
            hostAppend(itemOrderNum0, type, 'Brick', value);
            localStorage.brickSave = Number(localStorage.brickSave) - parseInt(type.split('/')[0]);
            break;
          case 'Steel':
            hostAppend(itemOrderNum0, type, 'Steel', value);
            localStorage.steelSave =  Number(localStorage.steelSave) - parseInt(type.split('/')[0]);
            break;
          case 'Silver':
            hostAppend(itemOrderNum0, type, 'Silver', value);
            localStorage.silverSave = Number(localStorage.silverSave) - parseInt(type.split('/')[0]);
            break;
          case 'Gold':
            hostAppend(itemOrderNum0, type, 'Gold', value);
            localStorage.goldSave = Number(localStorage.goldSave) - parseInt(type.split('/')[0]);
            break;
          case 'Platinum':
            hostAppend(itemOrderNum0, type, 'Platinum', value);
            localStorage.platinumSave = Number(localStorage.platinumSave) - parseInt(type.split('/')[0]);
            break;
          case 'Cell Phone':
            hostAppend(itemOrderNum0, type, 'Cell Phone', value);
            localStorage.cellPhoneSave = Number(localStorage.cellPhoneSave) - parseInt(type.split('/')[0]);
            break;
          case 'Computer':
            hostAppend(itemOrderNum0, type, 'Computer', value);
            localStorage.computerSave = Number(localStorage.computerSave) - parseInt(type.split('/')[0]);
            break;
          case 'Electronics Store':
            hostAppend(itemOrderNum0, type, 'Electronics Store', value);
            localStorage.electronicsStoreSave = Number(localStorage.electronicsStoreSave) - parseInt(type.split('/')[0]);
            break;
          case 'Computer Store':
            hostAppend(itemOrderNum0, type, 'Computer Store', value);
            localStorage.computerStoreSave = Number(localStorage.computerStoreSave) - parseInt(type.split('/')[0]);
            break;
          case 'Cafe':
            hostAppend(itemOrderNum0, type, 'Café', value);
            localStorage.cafeSave = Number(localStorage.cafeSave) - parseInt(type.split('/')[0]);
            break;
          case 'Restaurant':
            hostAppend(itemOrderNum0, type, 'Restaurant', value);
            localStorage.restaurantSave = Number(localStorage.restaurantSave) - parseInt(type.split('/')[0]);
            break;
        }
        myMarket();
        document.getElementById('inventory').innerHTML = invenCopy(false);
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

/* for adding items to the users live market, this includes the number of which
 * type of item, the price, and a delete button. The funtion also starts a timer
 * for which the item will be bought out */
function hostAppend(index, content, type, price) {
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

/* used to reference what type of item it is and then dealing with it based
 * on a ternary condition to either increase the amount of an item,
 * or return the average price */
function itemType(type, amount) {
  switch (type) {
    case 'Wood':
	  return ((amount) ? (localStorage.woodSave = Number(localStorage.woodSave) + amount) : 10);
      break;
    case 'Brick':
	  return ((amount) ? (localStorage.brickSave = Number(localStorage.brickSave) + amount) : 15);
      break;
    case 'Steel':
	  return ((amount) ? (localStorage.steelSave = Number(localStorage.steelSave) + amount) : 25);
      break;
    case 'Silver':
	  return ((amount) ? (localStorage.silverSave = Number(localStorage.silverSave) + amount) : 50);
      break;
    case 'Gold':
	  return ((amount) ? (localStorage.goldSave = Number(localStorage.goldSave) + amount) : 100);
      break;
    case 'Platinum':
	  return ((amount) ? (localStorage.platinumSave = Number(localStorage.platinumSave) + amount) : 150);
      break;
    case 'Cell Phone':
	  return ((amount) ? (localStorage.cellPhoneSave = Number(localStorage.cellPhoneSave) + amount) : 1000);
      break;
    case 'Computer':
	  return ((amount) ? (localStorage.computerSave = Number(localStorage.computerSave) + amount) : 1500);
      break;
    case 'Electronics Store':
	  return ((amount) ? (localStorage.electronicsStoreSave = Number(localStorage.electronicsStoreSave) + amount) : 10000);
      break;
    case 'Computer Store':
	  return ((amount) ? (localStorage.computerStoreSave = Number(localStorage.computerStoreSave) + amount) : 20000);
      break;
    case 'Cafe':
	  return ((amount) ? (localStorage.cafeSave = Number(localStorage.cafeSave) + amount) : 25000);
      break;
    case 'Restaurant':
	  return ((amount) ? (localStorage.restaurantSave = Number(localStorage.restaurantSave) + amount) : 75000);
      break;
  }
}

/* the bot buying function for the users market which buys the item,
 * crosses it out, adds the money to the users total amount,
 * and removes it after 2 seconds. void.*/
function botBuyMM(index, deleteSlot) {
  var content = document.getElementById('MMhost' + index).innerHTML.strike();
  document.getElementById('MMhost' + index).innerHTML = content;
  setTimeout(function(){
    localStorage.moneySave = parseInt(document.getElementById('itemPrice' + index).innerHTML.replace('$','')) + Number(localStorage.moneySave);
    document.getElementById('moneyP').innerHTML = `Money: $${localStorage.moneySave}`;
    deleteSlot.remove();
  }, 2000);
}


/* main function, called on start up. void */
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
  mSlotGen(); // generate light market items
  mSlotGenBig(); // generate large market items
  myMarket(); // if the user has items in their market they will display
  document.getElementById('moneyP').innerHTML = `Money: $${localStorage.moneySave}`; // display money
  document.getElementById('inventory').innerHTML = invenCopy(false);  // set inventory
}


main();
