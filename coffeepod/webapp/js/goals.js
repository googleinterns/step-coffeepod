

// REPLACE WITH CURRENT USER"S ID
const P_ID = "302vr6Tmw8t96kO5Ccof";

// asynchronous work

function getGoalCards() {
    db.collection('mentorship').doc(P_ID).collection("goals").get().then((snapshot) => {
        snapshot.docs.forEach(goalDocument => { // There should be just one goal document
            const allGoalCards = goalDocument.data().goalCards;
            putGoalCardsOnPage(allGoalCards);
        });
    });
}

// PUT THINGS FROM FIRESTORE ONTO PAGE
function loadData() {
    getGoalCards();
}


function putGoalCardsOnPage(allGoalCards) {
    for (i = 0; i < allGoalCards.length; i++) {
        const title = allGoalCards[i].title;
        const goals = allGoalCards[i].goals;
        console.log(goals);
        const goalCard = addOutlineGoalCard('goal-card-'+ i);
        const goalContent = addGoalCardContent(title, goals, i);
        goalCard.appendChild(goalContent);
        
    }
    
}

function addOutlineGoalCard(goalCardId) {
    const goalBoard = document.getElementById("goal-board");
    const goalCard = document.createElement('div');
	goalCard.classList.add("col-auto", "mb-3");
    goalCard.setAttribute("id", goalCardId);
    goalBoard.appendChild(goalCard);
    return goalCard;
}

function addGoalCardContent(title, goals, idNum) {
    const goalListId = "goal-list-" + idNum;
    const goalCardId = "goal-card-" + idNum;

    const goalContent = document.createElement('div');
	goalContent.classList.add("card", "goal-card");

    const goalCardBody = document.createElement('div');
    goalCardBody.setAttribute("class", "card-body");
    goalCardBody.setAttribute("id", goalCardId);
    addButton(goalCardBody,["btn", "float-right"], ["fas", "fa-plus"], "createNewGoal("+goalListId+")");

    const goalCardTitle = document.createElement('p');
    goalCardTitle.classList.add("card-title", "enter-leave");
    goalCardBody.appendChild(goalCardTitle);
    goalCardTitle.setAttribute('contenteditable', 'true');
    goalCardTitle.setAttribute('onclick', "selectText()");
    goalCardTitle.innerText = title;

    const goalListDiv = document.createElement('div');
    goalListDiv.classList.add("goals");
    const goalList = document.createElement('ul');
    goalList.setAttribute("id", goalListId);
    goalListDiv.appendChild(goalList);
    goalCardBody.appendChild(goalListDiv);

    // add goals to goals list
    //addGoals(goals,goalListId);

    addButton(goalCardBody, ["btn", "btn-goal", "delete-goal-card"], ["fas", "fa-trash"], "deleteGoalCard("+goalCardId+")");
    goalContent.appendChild(goalCardBody);

    return goalContent;
}

// create a new goal with checkbox and delete button
function addGoals(goals, goalListId) {
    console.log("In add goals");
    console.log(goals);
    const numCard = goalListId.substr(-1);
    const goalList = document.getElementById(goalListId);
    console.log(goalList);

    for(i = 0; i < goals.length; i++) {
        const goal = document.createElement('li');
        addCheckBox(goal);
        addButton(goal, ["btn", "btn-goal",  "delete-goal"], ["fa", "fa-times"], "deleteGoal(goal" + numCard + i +")");
        goal.innerHTML = goals[i].content;
    }

    goalList.appendChild(goal);
}


// create a whole new goal card with data already stored in firestore
function createGoalCard() {
	const goalBoard = document.getElementById("goal-board");
	const goalCard = document.createElement('div');
	goalCard.classList.add("col-auto", "mb-3");
    goalCard.setAttribute("id", "goal-card-!!");

	goalBoard.appendChild(goalCard);

	const goalContent = document.createElement('div');
	goalContent.classList.add("card", "goal-card");

	goalCard.appendChild(goalContent);

    const goalCardBody = document.createElement('div');
    goalCardBody.setAttribute("class", "card-body");
    addButton(goalCardBody,["btn", "float-right"], ["fas", "fa-plus"], "createNewGoal('goal-list-!!')");
    

    const goalCardTitle = document.createElement('p');
    goalCardTitle.classList.add("card-title", "enter-leave");
    goalCardBody.appendChild(goalCardTitle);
    goalCardTitle.setAttribute('contenteditable', 'true');
    goalCardTitle.setAttribute('onclick', "selectText()");
    goalCardTitle.innerText = "Title";


	/*goalContent.innerHTML = ' <div class="card-body"> <button class="btn float-right grayText" onclick="createNewGoal()"><i class="fas fa-plus" aria-hidden="true"></i></button> \
	<p contenteditable="true" onclick="selectText()" class="card-title">Title</p> \
	</div>';*/

    const goalListDiv = document.createElement('div');
    goalListDiv.classList.add("goals");
    const goalList = document.createElement('ul');
    goalList.setAttribute("id", "goal-list-!!");
    goalListDiv.appendChild(goalList);
    goalCardBody.appendChild(goalListDiv);

    addButton(goalCardBody, ["btn", "btn-goal", "delete-goal-card"], ["fas", "fa-trash"], "deleteGoalCard('goal-card-!!')");
    goalContent.appendChild(goalCardBody);
	
}



// Enter and leave the contenteditable area which works for dynamically added elements
$(document).on("keypress", '.enter-leave', function(e) {
    var keyC = e.keyCode;
    if (keyC == 13) {
         $(this).blur().next().focus();
        return false;
    }
});

// This version works with static content (content already added to HTML only)
/*$(document).ready(function() {
 $('.enter-leave').keydown(function(e) {
     if(e.which == 13) {
         //debugger;
        $(this).blur().next().focus();
        return false;
      }
      console.log("We are here!");
 });
 })*/

function holder() {

}


// call a function to delete a goal
function deleteGoal(id) {
    const goalToDelete = document.getElementById(id);
    goalToDelete.remove();
}

// delete a goal card
function deleteGoalCard(goalCardId) {
    const goalCard = document.getElementById(goalCardId);
    goalCard.remove();
}

// add a button to some parent with some classes and some onclick function
function addButton(parent, buttonClasses, iconClasses, onclickFunc) {
    const button = document.createElement('button');

    // use spread to add multiple classes
    button.classList.add(...buttonClasses);

    const icon = document.createElement('i');
    icon.classList.add(...iconClasses);
    button.setAttribute("onclick", onclickFunc);

    icon.setAttribute("aria-hidden", "true");
    //deleteIcon.setAttribute("onclick","deleteGoal"+goalId);
    button.appendChild(icon);
    parent.appendChild(button);
}



// add a checkbox to an individual goal
function addCheckBox(goal) {
    const checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');

    const label = document.createElement('label');
    label.classList.add("enter-leave");
    label.setAttribute("onclick", "selectText()");
    label.innerText = "Meet up";
    label.setAttribute("contenteditable", "true");
    goal.appendChild(checkBox);
    goal.appendChild(label);
}

// create a new goal with checkbox and delete button
function createNewGoal(goalListId) {
    console.log("I'm creating a new goal");
    const goalList = document.getElementById(goalListId);
    const goal = document.createElement('li');
    addCheckBox(goal);
    addButton(goal, ["btn", "btn-goal",  "delete-goal"], ["fa", "fa-times"], holder);

    goalList.appendChild(goal);
}

// when the user clicks on text, it selects all
function selectText() {
  document.execCommand('selectAll', false, null);
};


// create a whole new goal card
function createNewGoalCard() {
	const goalBoard = document.getElementById("goal-board");
	const goalCard = document.createElement('div');
	goalCard.classList.add("col-auto", "mb-3");
    goalCard.setAttribute("id", "goal-card-!!");

	goalBoard.appendChild(goalCard);

	const goalContent = document.createElement('div');
	goalContent.classList.add("card", "goal-card");

	goalCard.appendChild(goalContent);

    const goalCardBody = document.createElement('div');
    goalCardBody.setAttribute("class", "card-body");
    addButton(goalCardBody,["btn", "float-right"], ["fas", "fa-plus"], "createNewGoal('goal-list-!!')");
    

    const goalCardTitle = document.createElement('p');
    goalCardTitle.classList.add("card-title", "enter-leave");
    goalCardBody.appendChild(goalCardTitle);
    goalCardTitle.setAttribute('contenteditable', 'true');
    goalCardTitle.setAttribute('onclick', "selectText()");
    goalCardTitle.innerText = "Title";


	/*goalContent.innerHTML = ' <div class="card-body"> <button class="btn float-right grayText" onclick="createNewGoal()"><i class="fas fa-plus" aria-hidden="true"></i></button> \
	<p contenteditable="true" onclick="selectText()" class="card-title">Title</p> \
	</div>';*/

    const goalListDiv = document.createElement('div');
    goalListDiv.classList.add("goals");
    const goalList = document.createElement('ul');
    goalList.setAttribute("id", "goal-list-!!");
    goalListDiv.appendChild(goalList);
    goalCardBody.appendChild(goalListDiv);

    addButton(goalCardBody, ["btn", "btn-goal", "delete-goal-card"], ["fas", "fa-trash"], "deleteGoalCard('goal-card-!!')");
    goalContent.appendChild(goalCardBody);
	
}


/*window.load = function() {
	if (sessionStorage.inputBoxes) {
		console.log(document.getElementById("goal-board"));
		const goalBoard = document.getElementById("goal-board");
		//goalBoard.innerHTML = sessionStorage.inputBoxes;
		
	}
};*/






function addNode(checked){
	var newNode = document.createElement('article');      
newNode.innerHTML  = "<input type='checkbox' id='t"+cont+"' "+((checked)?"checked":"")+"/> <label for='t"+cont+"'></label><span contenteditable='true'>Task #"+cont+"</span>";
		newNode.id = "article"+cont;
		newNode.ondblclick = onDblClick;
		cont++;
	var main_sec = document.getElementById("main_sec");
		main_sec.appendChild(newNode);
		
		//main_sec.scrollTop = main_sec.scrollHeight;
}

function onDblClick(event){
	document.getElementById(event.target.id).remove();
}