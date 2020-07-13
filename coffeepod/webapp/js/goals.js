db.collection('mentorship').get()


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

// call a function to delete a goal
function deleteGoal(id) {
    const goalToDelete = document.getElementById(id);
    goalToDelete.remove();
}

// add delete button to each goal
function addDeleteButton(goal) {
    const deleteButton = document.createElement('button');
    deleteButton.classList.add("btn", "btn-goal",  "delete-goal");

    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add("fa", "fa-times");
    deleteIcon.setAttribute("aria-hidden", "true");
    deleteButton.appendChild(deleteIcon);

    goal.appendChild(deleteButton);
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
function createNewGoal() {
    const goalList = document.getElementById("goal-list-1");
    const goal = document.createElement('li');
    addCheckBox(goal);
    addDeleteButton(goal);

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

	goalBoard.appendChild(goalCard);

	const goalContent = document.createElement('div');
	goalContent.classList.add("card", "goal-card");

	goalCard.appendChild(goalContent);

	goalContent.innerHTML = ' <div id="goal-body" class="card-body"> <button class="btn grayText"><i class="fas fa-plus" aria-hidden="true"></i></button> \
	<p contenteditable="true" onclick="selectText()" class="cardTitle">Title</p> \
	</div>';

    const goalListDiv = document.createElement('div');
    const goalList = document.createElement('ul');
    goalList.setAttribute("id", "goal-list");
    goalListDiv.appendChild(goalList);

	sessionStorage.inputBoxes = goalBoard.innerHTML;
	
}

window.load = function() {
	if (sessionStorage.inputBoxes) {
		console.log(document.getElementById("goal-board"));
		const goalBoard = document.getElementById("goal-board");
		goalBoard.innerHTML = sessionStorage.inputBoxes;
		
	}
};


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
