//declaring the character instance
var jetpackGuy;
//declaring the character's image
var jetpackGuyPic;
//the array containing the clouds in the background
var allTheClouds = [];
//the array containing the clouds made from the jetpack
var allTheJpClouds = [];
//an array to give a random direction to the jpClouds
var randomDirection = [1, -1];
//the array containing the flags with the names of the mountains
var allTheFlags = [];
//declaring the song
var mySong;
//declaring the p5.Amplitude instance
var analyzer;
//the volume of the song
var volume = 0;
//the sum of the amounts of volume for each frame
var sommaVolume = 0;
//the json file containing name and elevation of the top peaks of many countries
var peaksData;
//declaring the play button image
var playButtonPic;
//declaring the stop button image
var stopButtonPic;
//boolean variable to check if the song is playing
var play = false;

function preload() {
  jetpackGuyPic = loadImage("./assets/jetpack_guy.png");
  cloudPic = loadImage("./assets/cloud.png");
  playButtonPic = loadImage("./assets/play.png");
  stopButtonPic = loadImage("./assets/stop.png");
  mySong = loadSound("./assets/Ravines.mp3");
  peaksData = loadJSON("./assets/top_peaks.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  analyzer = new p5.Amplitude();
  //setting the song as input for the p5.amplitude
  analyzer.setInput(mySong);
  imageMode(CENTER);
  ellipseMode(CENTER);
  //creating the instance of the character's object
  jetpackGuy = new JetpackGuy();
  //creating the instance of the clouds
  for (var i = 0; i < 40; i++) {
    var newCloud = new Cloud(random(0, width), random(0, height), random(2, 15));
    allTheClouds.push(newCloud);
  }
  //creating the instance of the jetpack clouds
  for (var i = 0; i < 100; i++) {
    var newJpCloud = new JpCloud(random(-20, 20), random(10, 50), random(0, 50), randomDirection[Math.round(random(0, 1))]);
    allTheJpClouds.push(newJpCloud);
  }
  //creating the instance of the flags
  for (var i = 0; i < peaksData.peaks.length; i++) {
    var newFlag = new Flag(peaksData.peaks[i].heightM, peaksData.peaks[i].name);
    allTheFlags.push(newFlag);
  }
}

function draw() {
  //background that changes during the song
  background(109 - sommaVolume / 2, 167 - sommaVolume, 192 - sommaVolume / 3);
  //calling the display method for the clouds
  for (var i = 0; i < allTheClouds.length; i++) {
    var cloud = allTheClouds[i];
    cloud.display();
  }
  //calling the display method for the jetpack clouds
  for (var i = 0; i < allTheJpClouds.length; i++) {
    var jpcloud = allTheJpClouds[i];
    jpcloud.display();
    jpcloud.move();
  }
  //creating the pillar for the flags
  push();
  noStroke();
  fill(40);
  rect(width / 2 + 300, height - peaksData.peaks[0].heightM * 10, 30, peaksData.peaks[0].heightM *10);
  pop();
  //calling the display method for the clouds
  for (var i = 0; i < allTheFlags.length; i++) {
    var flag = allTheFlags[i];
    flag.display();
  }
  //calling the display and move methods for the character
  jetpackGuy.display();
  jetpackGuy.move();


  //checking the state of the play button, setting the volume
  if (play == true) {
    volume = analyzer.getLevel();
    volume = map(volume, 0, 1, 0, height / 4);
    sommaVolume += volume / 1000;
    //calling the move method for clouds and flags
    for (var i = 0; i < allTheClouds.length; i++) {
      var cloud = allTheClouds[i];
      cloud.move();
    }
    for (var i = 0; i < allTheFlags.length; i++) {
      var flag = allTheFlags[i];
      flag.move();
    }
    //playing the song
    if (mySong.isPlaying() == false) {
      mySong.play();
    }
    //setting the stop as image for the button
    image(stopButtonPic, 100, 100, stopButtonPic.width, stopButtonPic.height);
  } else {
    //setting the play as image for the button and stopping the song
    image(playButtonPic, 100, 100, playButtonPic.width, playButtonPic.height);
    mySong.stop();
  }



}
//costructor of the character object
function JetpackGuy() {
  this.x = width / 4;
  this.y = height - jetpackGuyPic.height * 1.5;
  this.direction = -1;
  this.display = function() {
    image(jetpackGuyPic, this.x, this.y, jetpackGuyPic.width, jetpackGuyPic.height);
  }
  //method that makes the character move in a levitating-like way
  this.move = function() {
    this.y += 0.5 * this.direction;
    if (this.y >= height - jetpackGuyPic.height * 1.4 || this.y <= height - jetpackGuyPic.height * 1.6) {
      this.direction *= -1;
    }
  }
}
//costructor of the cloud object
function Cloud(_x, _y, _size) {
  this.x = _x;
  this.y = _y;
  this.wdth = cloudPic.width / _size;
  this.hght = cloudPic.height / _size;
//method that makes the clouds move according to the volume of the song (and the size, to create a parallax effect)
  this.move = function() {
    this.y += volume / _size;
    //to make them return on the top of the screen when arrived at the bottom
    if (this.y >= height + this.hght / 2) {
      this.y = -this.hght / 2;
    }
  }

  this.display = function() {
    push();
    blendMode(SOFT_LIGHT);
    image(cloudPic, this.x, this.y, this.wdth, this.hght);
    pop();
  }
}
//costructor of the jetpack cloud object generating from the character position
function JpCloud(_x, _size, _color, _direction) {
  this.x = jetpackGuy.x - 30 + _x;
  this.y = jetpackGuy.y + jetpackGuyPic.height / 5;
  this.size = _size;
  this.color = _color;
  this.speed = this.size / 3;

  this.move = function() {
    this.y += this.speed;
    this.x += this.speed / 8 * _direction;
    if (this.y >= height + this.size / 2) {
      this.x = jetpackGuy.x - 30 + _x;
      this.y = jetpackGuy.y + jetpackGuyPic.height / 5;
    }
  }

  this.display = function() {
    noStroke();
    fill(0 + volume + this.color, 54 + this.color, 109 + this.color);
    ellipse(this.x, this.y, this.size);
  }
}
//costructor of the flag object, that will have the mountain elevation as y position and the name of the mountain as text
function Flag(_height, _name) {
  this.x = width / 2;
  this.y = height - _height * 10;
  this.text = _name;
//making it move according to the music too
  this.move = function() {
    this.y += volume / 6;
  }

  this.display = function() {
    push()
    noStroke();
    fill(180);
    rect(this.x, this.y, 300, 100, 50, 0, 0, 50);
    pop();
    push();
    fill(0);
    drawingContext.font = "26px sans-serif";
    drawingContext.textAlign = "center";
    text(this.text, this.x + 150, this.y + 60);
    pop();
  }
}

//making the play button work
function mouseClicked() {
  if (mouseX >= 50 && mouseX <= 150 && mouseY >= 50 && mouseY <= 150){
  if (play == false) {
    play = true;
  } else {
    play = false;
  }
  }
}
