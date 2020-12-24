// <Prompt>, <LeftText>, <RightText>, <Left>, <Right>
// story[] = ["", "", 0, 0];
var story = [];
// Use this as a stack
var actions = [];


function init() {
  actions.push(0)

  story[0] = ["It's Christmas Day in the North Vancouver Boldt household, and what better way to start the day other than to...",
  "Stay inside and keep all the Christmas outside the house", "Explore the city",
  1, 6];
  story[1] = ["Man, ya, this is a good decision, think of all the things you can do inside that you can't outside. There's uhh... there's uhhhh...",
  "The bed", "Bojack baby!",
  2, 4];
  story[2] = ["Ahh, Good choice. That is until you find whatever Madeline spilled on the side of your bed. Goddammit Madeline!",
  "Prepare to scrap", "Lay on the floor in defeat",
  8, 3];
  story[3] = ["Eventually, your sadness turns into anger and you're ready to fight Madeline",
  "The poor kid doesn't stand a chance", null,
  8, null];
  story[4] = ["The music starts playing, \"back in the 90s...\"... wait, is this the 90s! What is this?! A time travel episode?",
  "Wow, it really is the 90s", null,
  5, null];
  story[5] = ["Wow, think of all the things you can do in the city for a 90s Christmas",
  "You think that Heelys were big in the 90s... right?", "You try to get rich off betting in sports like in Back to the Future",
  13, 15];
  story[6] = ["Wow, it's actually cold out, maybe that's because...",
  "You are once again not wearing a jacket", "You somehow warped back to the 90s before global warming was a big deal and that's why it's so cold",
  7, 5];
  story[7] = ["Madeline must have taken all your jackets. GOD! And probably is braking glasses on them right now! GOD!",
  "Prepare to scrap", null,
  8, null];
  story[8] = ["Start walking towards Madeline. You shouldn't know what direction that is but you do. Like God himself is guiding your rage because goddammit this is the right decision. You see Madeline in the distance.",
  "Start approaching Madeline", null,
  9, null];
  story[9] = ["God, she's far away. You need to move faster",
  "Put on some slides for extra grip", "Get some Heelys",
  10, 16];
  story[10] = ["Now you're really moving! You rush towards Madeline and she says \"Stop! What are you doing?!\"",
  "You say \"You know exactly what you did!\"", "You totally forget lol",
  11, 11];
  story[11] = ["Madeline says \"God Annika! You don't have to solve everything with such violence. And even if you did, at least do it right...\"", "What do you mean?", null,
  12, null];
  story[12] = ["If we are going to fight, we should at least put it on pay-per-view television so we can make some money from it", "Hmm, she's right. Start to organize a televised fight against Madeline", null,
  19, null];
  story[13] = ["You had no idea Heelys weren't a 90s thing and now I guess you're technically the creator of Heelys",
  "HAH! The inventor, \"Mr. Heely\", has to be faster than that if he's going to invent Heelys. Loser", null,
  14, null];
  story[14] = ["You know Heelys are going to be big",
  "Save no expense and open up a Heely factory", "Give up on the idea and explore the 90s Christmas some more",
  18, 5];
  story[15] = ["You realize no one really bets much on hockey and you totally forget what teams won in other sports during the 90s", "Try to organize a pay-per-view fight with Madeline and get money from sports that way", null,
  19, null];
  story[16] = ["Ok, Madeline is going to have to wait a while, you've got to get some Heelys",
  "Go to Walmart", "Go to a shoe store",
  17, 17];
  story[17] = ["These Heelys... they're fine. I mean they're fine, but you want some real high-quality Heelys",
  "Do you have to do everything around here? Decide to open up a Heely factory", null,
  18, null];
  story[18] = ["Get the factory up and running and call it \"Heelys: Get Ready to Boldt\"",
  "Check out how the factory is doing", "Sit back and relax. You have nothing to worry about!",
  27, 28];
  story[19] = ["Word spreads about the Boldt battle and a month before the fight it is just know colloquially as \"The Event\"",
  "You're getting nervous", "You know you got this fight easy",
  20, 23];
  story[20] = ["God, you haven't been this nervous since the math department announced there would be no partial marks",
  "Start getting even more stressed out because now you're thinking about math", "Start practicing fighting",
  21, 24];
  story[21] = ["Oh God, you're spiralling now",
  "Study for your fight by watching Kung Fu Panda with your fighting coach", "Start panicking and fire your fighting coach",
  25, 22];
  story[22] = ["Ok, well your poor fighting teacher is fired now. But the fight is tomorrow",
  "Watch YouTube tutorial videos in preparation", null,
  26, null];
  story[23] = ["People are asking what type of fight this is and the answer has just been \"barbaric\"",
  "Start training", null,
  24, null];
  story[24] = ["You meet your mentor and it's just a normal guy that has a Kung Fu Panda shirt",
  "Fire this kid!", "Watch Kung Fu Panda with him",
  22, 25];
  story[25] = ["Ok, you just finished watching Kung Fu Panda with him and you hope that's going to be your competitive edge because the fight is tomorrow",
  "You feel pretty good about this", null,
  26, null];
  story[26] = ["You wake up the next day and it's the day of the fight",
  "You put on your robe and your slides and head to the stadium", null,
  31, null];
  story[27] = ["You go to the factory and it is chaotic! The factory employees are wearing the Heelys to work faster but they keep falling",
  "Invest in a Heelys workplace safety video", "Replace the floor of the factory with mattresses",
  28, 28];
  story[28] = ["The critics are rating your Heelys \"dangerous\" and \"not for children\"",
  "Make your Heelys lame and slow and \"safe\"", "Stay true to the high-quality engineering of your Heelys",
  29, 30];
  story[29] = ["You Saved the company! At what cost? HAH! You Don't care. You're rich! Merry Christmas Annika!",
  null, null,
  null, null];
  story[30] = ["The company goes under but Goddammit you're happy with your decision. Heelys are so much more than a shoe and they won't just be stepped on. Merry Christmas Annika!",
  null, null,
  null, null];
  story[31] = ["You hear your name introduced over the speaker. Or was that your name...? They just said \"Boldt\"",
  "You start walking towards the ring", "You stay back",
  32, 34];
  story[32] = ["Oh, tough break! It was actually Maddie's name that was called and the spotlight follows her to the ring. Unfortunately, you're such a fast walker that you actually beat her to the ring",
  "You're so embarrassed you just kind of lay there", null,
  33, null];
  story[33] = ["You technically lost the fight because you wouldn't stand back up. Although, people thought it was some sort of political statement and now you're meeting with Trudeau next week! Merry Christmas Annika!",
  null, null,
  null, null];
  story[34] = ["Wow, that was close. They actually called Maddie so good choice. The bell rings and the fight starts.",
  "Deploy the Kung Fu moves", "Free-style the fight. No method, no problem",
  35, 35];
  story[35] = ["Excellent choice. Madeline didn't stand a chance. I know I'm just the narrator, but I'll tell you that this outcome of winning the fight and getting rich was of the more favourable options. Merry Christmas Annika!",
  null, null,
  null, null];
}


/**
 * Returns what the back button should point to.
 */
function updateHistory(storyKey) {
  // Check if we're going back
  if(actions[actions.length-2] == storyKey && actions.length > 2)
    actions.pop();
  else
    actions.push(storyKey);

  let res = 0;
  if(actions.length >= 2)
    res = actions[actions.length - 2];

  return res;
}


function progress(storyKey) {
  let prompt = document.getElementById("prompt");
  let left = document.getElementById("left");
  let right = document.getElementById("right");
  let backBtn = document.getElementById("backBtn");
  let leftContainer = document.getElementById("left-container");
  let rightContainer = document.getElementById("right-container");



  // Update history
  let previous = updateHistory(storyKey);

  // Add text
  prompt.innerHTML = story[storyKey][0];

  left.innerHTML = story[storyKey][1];

  let isEnd = (story[storyKey][1] == null);
  let twoAnswers = (story[storyKey][2] != null);

  if(isEnd) {
    leftContainer.style.display = "none";
    rightContainer.style.display = "none";
  }
  else  {
    leftContainer.style.display = "block";

    if(!twoAnswers) {
      rightContainer.style.display = "none";
      leftContainer.classList.remove("col-6");
      leftContainer.classList.add("col-12");
    }
    else {
      right.innerHTML = story[storyKey][2];
      leftContainer.classList.remove("col-12");
      leftContainer.classList.add("col-6");
      rightContainer.style.display = "block";
    }
  }

  leftContainer.style.display = "none";
  rightContainer.style.display = "none";
  backBtn.style.display = "none";
  animatePrompt(twoAnswers, isEnd);


  // Add links
  left.onclick = function() { progress(story[storyKey][3]) };
  right.onclick = function() { progress(story[storyKey][4]) };
  backBtn.onclick = function() { progress(previous) };

  // Cha cha real smooth
}


function main() {
  init();
  progress(0);
}


main()
