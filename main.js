




//global variables
var deckNum = -1;
var deckArray = new Array();
//localStorage.clear();
var deckArrayJSON = JSON.parse(localStorage.getItem("deck")) || new Array();




//card class
var Card = function(item, description, deck, id) {
	this.item = item;
	this.description = description;
	this.stage = "item";
	this.deck = deck;
	this.id = id;
	this.card = this.cardContainer(item, description);
	this.side = "item";
	//turn and moving functionality
	this.card.addEventListener("click",  e => this.turn(e));
	this.card.addEventListener('pointerdown', e => this.dragStart(e));

	this.originX = null;
	this.originY = null;
	this.currentX = null;
	this.currentY = null;
	this.dragStarted = false;
    //hide card by defualt
    this.hide();
    }


// create card container as seperate canvas elements
Card.prototype.cardContainer = function(item, description){
	const cardContainer = document.createElement('canvas');
	cardContainer.classList.add("card");
	cardContainer.setAttribute("id", this.id+"#"+this.deck.id);
	document.querySelector("#main").appendChild(cardContainer);

	//default canvas properties
	var canvas = document.getElementById(this.id+"#"+this.deck.id);
	var ctx = canvas.getContext("2d");
	ctx.textAlign = "center"; 
	ctx.font = "30px Arial";
	this.scaleX=100;
	this.scaleDirection=-1;	
	ctx.fillStyle = "red";
	ctx.fillRect(0, 0, canvas.width,canvas.height);
	ctx.fillStyle = "black";
	ctx.textAlign = "center"; 
	ctx.fillText(this.item, canvas.width/2, canvas.height/2);
	return cardContainer;
}

//moving card functionality
Card.prototype.dragStart = function(event) {
	this.originX = event.clientX;
	this.originY = event.clientY;    
	this.dragStarted = true;
	const appContainer = document.querySelector('body');

	//listen to move or up events after clicking on card
	document.onmousemove = dragMove.bind(this);
	document.onmouseup = dragEnd.bind(this);


	//function to handle end of movement
	function dragEnd(event){
		this.dragStarted = false;
		//if card was not moved enough to side, return card to original position
		if (this.currentX < 150 && this.currentX > -150) {
	      this.card.classList.add("return");
	    //else move to the next card
	  	}else{
	  		this.deck.nextCard();
	  		//correct 
	  		if (this.currentX > -150) {
	  			new Audio("data/correct.mp3").play();
	  			this.deck.correct ++;
	  		//incorrect
	  		}else{
	  			new Audio("data/incorrect.mp3").play();
	  			this.deck.incorrect++;
	  		}

	  	//bring card to original stage
	  	this.originX = null;
	  	this.originY = null;
	  	this.currentX = null;
	  	this.currentY = null;
	  	this.dragStarted = false;
	  	this.card.style.transform = "none";
	  	appContainer.style.backgroundColor = "#839493";

	  	//change score status at all places
	  	var correct = document.getElementsByClassName("correct");
	  	var incorrect = document.getElementsByClassName("incorrect");
	  	var i;
	  	for (i = 0; i < correct.length; i++) {
	  		correct[i].textContent = this.deck.correct;
	  		incorrect[i].textContent = this.deck.incorrect;
	  	}
	  }
	}


	//function handeling card movement
	function dragMove(event){
			console.log("move")
		if (!this.dragStarted) {
				return;
			}
		e = event || window.event;
		e.preventDefault();

		//Deactivate bouncing back of card
		this.card.classList.remove("return");

		// Flashcard transform
		this.currentX = e.clientX - this.originX;
		this.currentY = e.clientY - this.originY;
		const rotateDeg = 0.15*this.currentX;
		this.card.style.transform =
		'translate(' + this.currentX + 'px, ' + this.currentY + 'px)' +
		' rotate(' + rotateDeg + 'deg)';




		//change background color in case the card is already at the position from which it will not jump back
	    if (this.currentX >= 150 || this.currentX <= -150) {         // 150 px to the right or left
	      appContainer.style.backgroundColor = "#4a5454";

	    }
	   
	    else {                              // In the middle
	      appContainer.style.backgroundColor = "#839493";

	    }
		
	}
}




//flipping card
Card.prototype.turn = function(event){

	
	var canvas=document.getElementById(this.id+"#"+this.deck.id);
	var ctx=canvas.getContext("2d");
	animate.call(this);



	//redraw canvas while flipping	
 	function draw(scaleX,ctx) {

 		ctx.clearRect(0,0,canvas.width,canvas.height);


 		//flipping in one direction
 		if(scaleX>=0){
 			ctx.scale(scaleX,1);
			ctx.fillStyle = "red";
			ctx.fillRect(0, 0, canvas.width,canvas.height);
			ctx.stroke();
			ctx.fillStyle = "black";
			ctx.textAlign = "center"; 
			ctx.fillText(this.item, canvas.width/2, canvas.height/2);

		//flipping in another direction
		}else{
			ctx.scale(-scaleX,1);
		   	ctx.fillStyle = "blue"
		   	ctx.fillRect(0, 0, canvas.width, canvas.height);
		   	ctx.stroke();
		   	ctx.fillStyle = "black";
		   	ctx.fillText(this.description, canvas.width/2, canvas.height/2);
		}

		ctx.setTransform(1,0,0,1,0,0);
	}

	//animate flipping
	function animate(){
		
		// draw card which is flipping
		draw.call(this, this.scaleX/100,ctx);
		//using scale as flipping factor
		this.scaleX+=2*this.scaleDirection;
		//continue animating flipping
		if(this.scaleX !=100 && this.scaleX!=-100){
			requestAnimationFrame(animate.bind(this));
		}
		//if flip is ended change the flipping direction for next turn
		if(this.scaleX<-100 || this.scaleX>100){
			this.scaleDirection*=-1;
			this.scaleX+=2*this.scaleDirection;
		}
	}
}




Card.prototype.hide = function(){
	this.card.classList.add('inactive');
}


Card.prototype.show = function(){
	this.card.classList.remove('inactive');
}



//Deck class
var Deck = function (title, id) {
	this.cards = new Array();
	this.amount = -1;
	this.title = title;
	this.correct =0;
	this.incorrect = 0;
	this.cardIndex = 0;
	this.id = id;
}



Deck.prototype.addCard = function(item, des){
	this.amount++;
	card = new Card(item, des, this, this.amount)
	this.cards.push(card);
}


//load deck from local storage
Deck.prototype.load = function(cards){
	for (var i = 0; i < cards.length; i++) {
		this.amount++;
		card = new Card(cards[i].item, cards[i].description, this, this.amount)
		this.cards.push(card);
	}
}


Deck.prototype.nextCard = function(){
	//hide current card
	this.cards[this.cardIndex].hide();
	//show next card
	if(this.cardIndex < this.amount){
		this.cardIndex++
		this.cards[this.cardIndex].show();
	}else{
		//move to result page
		document.getElementById("result").classList.remove('inactive');
		document.getElementById("main").classList.add('inactive');
	}
}

//reset deck to original state
Deck.prototype.resetDeck = function(){
	this.cards[this.cardIndex].hide();
	this.correct = 0;
	this.incorrect = 0;
	this.cardIndex = 0;
	document.querySelector(".incorrect").textContent = this.incorrect ;
	document.querySelector(".correct").textContent = this.correct;
}



//help function for converting ciruclar array to json format 
const getCircularReplacer = () => {
	const seen = new WeakSet();
	return (key, value) => {
		if (typeof value === "object" && value !== null) {
			if (seen.has(value)) {
				return;
			}
			seen.add(value);
		}
		return value;
	};
};



// load decks from local storage
for (var i = 0; i < deckArrayJSON.length; i++) {
	deckNum++;

	//create deck from deck in local storage
	var deck = new Deck(deckArrayJSON[i].title, deckNum);
	//add deck into deck list
	var btn = document.createElement("BUTTON");
	btn.innerHTML = deck.title;
	btn.classList.add("btn","button-list");
	btn.onclick = function(title){
		return function () {

			train(title);
		};
	}(btn.innerHTML);
	document.getElementById('menu').appendChild(btn);
	//load cards from local storage into created deck
	deck.load(deckArrayJSON[i].deck.cards);
	//add loaded deck into deck array
	deckArray.push({'title': deck.title, 'deck':deck }); 
}






//handeling page layout after card was added
function add(){
	
	function updatePlaceholder() {
		document.getElementById("newItem").placeholder =
		"...another term?";
		document.getElementById("newDef").placeholder =
		"...and another definition?";
	}

	function clearForm() {
		document.getElementById("newItem").value = "";
		document.getElementById("newDef").value = "";

	}

	//add card into deck
	currentDeck.addCard(document.getElementById("newItem").value, document.getElementById("newDef").value);
	clearForm();
	updatePlaceholder();
};


//go to the page where you can add cards to current deck
function setAddPage(){
	document.getElementById("menu").classList.add('inactive');
	document.getElementById("main").classList.add('inactive');
	document.getElementById("deck").classList.remove('inactive');
	document.getElementById("newDeck").value = "";
	document.getElementById("newDeck").placeholder =
	"Enter name of a new deck...";
	
};


//handle creating new set
function createSet(){
	title = document.getElementById("newDeck").value;
	var copy = deckArray.find(x => x.title === title);

	//check if deck with suggested name already exist
	if(!copy){
		deckNum++;
		deck2 = new Deck(title, deckNum);
		currentDeck = deck2;
		setAddPage();
		// add new deck to the list of the decks
		var btn = document.createElement("BUTTON");
		btn.innerHTML = currentDeck.title;
		btn.classList.add("btn","button-list");
		btn.onclick = function(){train(btn.innerHTML)};
		document.getElementById('menu').appendChild(btn);
		document.getElementById('sameName').classList.add('inactive');

	}else{
		//if there is deck already with this name, shake button and throw error message to user
		document.getElementById('sameName').classList.remove('inactive');
		shake(document.getElementById("addNewDeck"));
	}
};


//handle page layout after user finishes adding cards
function done(){
	if(currentDeck.amount > -1){
		home();
		deckArray.push({'title': currentDeck.title, 'deck':currentDeck }); 
		//store created deck and its card into local storage
		localStorage.setItem("deck", JSON.stringify(deckArray,  getCircularReplacer()) );
		document.getElementById('noCard').classList.add('inactive');

	}else{
		document.getElementById('noCard').classList.remove('inactive');
		shake(document.getElementById("done"));
	}

}

//set layout of home page
function home(){
	document.getElementById("menu").classList.remove('inactive');
	document.getElementById("deck").classList.add('inactive');
	document.getElementById("main").classList.add('inactive');
	document.getElementById("result").classList.add('inactive');
	//reset stage of current deck after returning to home page
	currentDeck.resetDeck();	
}




//practice cards of chosen deck
function train(deck){
	//set layout of main (card training) page
	document.getElementById("menu").classList.add('inactive');
	document.getElementById("main").classList.remove('inactive');
	currentDeck  = deckArray.find(x => x.title === deck).deck;
	//show card with which you will start training
	currentDeck.cards[currentDeck.cardIndex].show();
}



//hadnle layout and reseting deck and its score when user chooses to practice the same deck again
function again(){
	document.getElementById("result").classList.add('inactive');
	document.getElementById("main").classList.remove('inactive');
	currentDeck.resetDeck();
	currentDeck.cards[currentDeck.cardIndex].show();

}





//handle uploading list of cards as excel file
function Upload() {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById("fileUpload");

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
        	var reader = new FileReader();

            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                	ProcessExcel(e.target.result);
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                    	data += String.fromCharCode(bytes[i]);
                    }
                    ProcessExcel(data);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);


            }
            alert("Upload successful");
            document.getElementById("fileUpload").value = "";
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid Excel file.");
    }
};


//Cards in excel sheet must be in two columns, first row needs to be fill out with words item and definition
function ProcessExcel(data) {
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];
    //Read all rows from First Sheet into an JSON array.
   	var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
    //Add the data rows from Excel file.
    for (var i = 0; i < excelRows.length; i++) {
        //first row needs to be fill out with words item and definition, otherwise this will not work
        currentDeck.addCard(excelRows[i].item, excelRows[i].definition);
    }
};



//shaking buttons
var shakingElements = [];
var shake = function (element, magnitude = 16) {

	//A counter to count the number of shakes
	var counter = 1;
	var numberOfShakes = 15;
	var startX = 0, startY = 0;
	var magnitudeUnit = 0.64;

	//The `randomInt` helper function
	var randomInt = (min, max) => {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	//Add the element to the `shakingElements` array if it
	//isn't already there
	if(shakingElements.indexOf(element) === -1) {
		shakingElements.push(element);
	  	upAndDownShake();
	}

  	//The shake function in up and down direction
  	function upAndDownShake() {
  		if (counter < numberOfShakes) {

      		//Reset the element's position at the start of each shake
      		element.style.transform = 'translate(' + startX + 'px, ' + startY + 'px)';
      		//reduce the magnitude by which the element is shaked
      		magnitude -= magnitudeUnit;
      		//Randomly change the element's position
      		var randomX = randomInt(-magnitude, magnitude);
      		var randomY = randomInt(-magnitude, magnitude);
      		element.style.transform = 'translate(' + randomX + 'px, ' + randomY + 'px)';
      		counter += 1;
      		requestAnimationFrame(upAndDownShake);
  		}

	    //When the shaking is finished, restore the element to its original 
	    //position and remove it from the `shakingElements` array
	    if (counter >= numberOfShakes) {
	    	element.style.transform = 'translate(' + startX + ', ' + startY + ')';
	    	shakingElements.splice(shakingElements.indexOf(element), 1);
	    }
	}
}



