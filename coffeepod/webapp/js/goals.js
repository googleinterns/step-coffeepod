


/*var cont = 1;
var days = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"];
var months = ["JAN","FEB","MAR","APR", "MAY","JUN", "JUL","AUG","SEP","OCT","NOV","DEC"];
window.onload = function(){
	
	var date = new Date();
	document.getElementById('day').innerHTML = date.getDate();
	document.getElementById('year').innerHTML = date.getFullYear();
	document.getElementById('month_name').innerHTML = months[date.getMonth()];
	document.getElementById('week').innerHTML = days[date.getUTCDay()];
	
	document.getElementById("add_but").addEventListener("click", function(){
		addNode(false);
	});
	
	addNode(true);
	addNode();
	
}
*/

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
    label.setAttribute("onclick", "selectText()");
    label.innerText = "Meet up";
    label.setAttribute("contenteditable", "true");
    goal.appendChild(checkBox);
    goal.appendChild(label);
}

// create a new goal with checkbox and delete button
function createNewGoal(goalListId) {
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
    goalCard.setAttribute("id", "goal-card-2");

	goalBoard.appendChild(goalCard);

	const goalContent = document.createElement('div');
	goalContent.classList.add("card", "goal-card");

	goalCard.appendChild(goalContent);

    const goalCardBody = document.createElement('div');
    goalCardBody.setAttribute("class", "card-body");
    addButton(goalCardBody,["btn", "float-right"], ["fas", "fa-plus"], "createNewGoal('goal-list-2')");
    

    const goalCardTitle = document.createElement('p');
    goalCardBody.appendChild(goalCardTitle);
    goalCardTitle.setAttribute('contenteditable', 'true');
    goalCardTitle.setAttribute('onclick', "selectText()");
    goalCardTitle.classList.add("card-title");
    goalCardTitle.innerText = "Title";


	/*goalContent.innerHTML = ' <div class="card-body"> <button class="btn float-right grayText" onclick="createNewGoal()"><i class="fas fa-plus" aria-hidden="true"></i></button> \
	<p contenteditable="true" onclick="selectText()" class="card-title">Title</p> \
	</div>';*/

    const goalListDiv = document.createElement('div');
    goalListDiv.classList.add("goals");
    const goalList = document.createElement('ul');
    goalList.setAttribute("id", "goal-list-2");
    goalListDiv.appendChild(goalList);
    goalCardBody.appendChild(goalListDiv);

    addButton(goalCardBody, ["btn", "btn-goal", "delete-goal-card"], ["fas", "fa-trash"], "deleteGoalCard('goal-card-2')");
    goalContent.appendChild(goalCardBody);
	
}

/*
// create a whole new goal card where users can add new goals
function createNewGoalCard() {
    // Create a goal card (outer bone)
	const goalBoard = document.getElementById("goal-board");

	const goalCard = document.createElement('div');
	goalCard.classList.add("col-auto", "mb-3");
    goalCard.setAttribute("id", "goal-card-2");
	goalBoard.appendChild(goalCard);

    // Goal content includes body, title, list of goals, add and delete buttons
	const goalContent = document.createElement('div');
	goalContent.classList.add("card", "goal-card");

    const goalCardBody = document.createElement('div');
    goalCardBody.setAttribute("class", "card-body");
    addButton(goalCardBody,["btn", "float-right"], ["fas", "fa-plus"], "createNewGoal()");

    const goalCardTitle = document.createElement('p');
    goalCardTitle.setAttribute('contenteditable', 'true');
    goalCardTitle.setAttribute('onclick', selectText());
    goalCardTitle.classList.add("card-title");
    goalCardTitle.innerText = "Title";

    const goalListDiv = document.createElement('div');
    const goalList = document.createElement('ul');
    goalList.setAttribute("id", "goal-list");
    goalListDiv.appendChild(goalList);

    goalContent.appendChild(goalCardTitle);
    goalContent.appendChild(goalCardBody);
    goalCardBody.appendChild(goalListDiv);
    addButton(goalCardBody,["btn", "float-right"], ["fas", "fa-plus"], deleteGoalCard("goal-card-2"));
    
    goalCard.appendChild(goalContent);
} */

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
