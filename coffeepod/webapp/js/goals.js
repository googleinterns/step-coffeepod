
// REPLACE WITH CURRENT USER'S ID
const mentorshipID = "302vr6Tmw8t96kO5Ccof";

// asynchronous work

function getGoalCards() {
    db.collection('mentorship').doc(mentorshipID).collection("goals").get().then((snapshot) => {
        // allGoalCards is an array of goalCards
        const allGoalCards = [];
        snapshot.docs.forEach(goalDocument => { // There should be just one goal document
            allGoalCards.push(goalDocument.data());
        });
        putGoalCardsOnPage(allGoalCards);
    });
}

// PUT THINGS FROM FIRESTORE ONTO PAGE
function loadData() {
    getGoalCards();
}


function putGoalCardsOnPage(allGoalCards) {
    for (i = 0; i < allGoalCards.length; i++) {
        const title = allGoalCards[i].title;
        const checkedGoals = allGoalCards[i].checked;
        const uncheckedGoals = allGoalCards[i].unchecked;
        const goalCard = addOutlineGoalCard('goal-card-'+ i);
        const goalContent = addGoalCardContent(title, checkedGoals, uncheckedGoals, i);
        goalCard.appendChild(goalContent);
        console.log("finish creating card num: " + i);
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

function addGoalCardContent(title, checkedGoals, uncheckedGoals, idNum) {
    const goalCheckedListId = "goal-checked-list-" + idNum;
    const goalUncheckedListId = "goal-unchecked-list-" + idNum;
    const goalCardId = "goal-card-" + idNum;

    const goalContent = document.createElement('div');
	goalContent.classList.add("card", "goal-card");

    const goalCardBody = document.createElement('div');
    goalCardBody.setAttribute("class", "card-body");
    goalCardBody.setAttribute("id", goalCardId);
    addButton(goalCardBody,["btn", "float-right"], ["fas", "fa-plus"], "createNewGoal("+goalUncheckedListId+")");

    const goalCardTitle = document.createElement('p');
    goalCardTitle.classList.add("card-title", "enter-leave");
    goalCardBody.appendChild(goalCardTitle);
    goalCardTitle.setAttribute('contenteditable', 'true');
    goalCardTitle.setAttribute('onclick', "selectText()");
    goalCardTitle.innerText = title;

    const goalListDiv = document.createElement('div');
    goalListDiv.classList.add("goals");

    const goalUncheckedList = document.createElement('ul');
    goalUncheckedList.setAttribute("id", goalUncheckedListId);

    const goalCheckedList = document.createElement('ul');
    goalCheckedList.setAttribute("id", goalCheckedListId);
    

    const lineBreak = document.createElement('hr');
    
    goalListDiv.appendChild(goalUncheckedList);
    goalListDiv.appendChild(lineBreak);
    goalListDiv.appendChild(goalCheckedList);
    goalCardBody.appendChild(goalListDiv);

    addGoals(uncheckedGoals, goalUncheckedList, false);
    addGoals(checkedGoals, goalCheckedList, true);

    addButton(goalCardBody, ["btn", "btn-goal", "delete-goal-card"], ["fas", "fa-trash"], 'deleteGoalCard(' + "'"+goalCardId+"'" + ')');
    goalContent.appendChild(goalCardBody);
    return goalContent;
}

// create a new goal with checkbox and delete button
function addGoals(goals, goalList, checked) {
    const startIdx = goalList.id.lastIndexOf("-");
    const numCard = goalList.id.substring(startIdx + 1);
    for(j = 0; j < goals.length; j++) {
        let goalId = 'goal-';
        if (checked) {
            goalId += 'checked-' + numCard + '-' + j;
        } else {
            goalId += 'unchecked-' + numCard + '-' + j;
        }
        
        const goal = document.createElement('li');
        goal.setAttribute("id",goalId);
        addCheckBox(goal, goals[j], checked);
        addButton(goal, ["btn", "btn-goal",  "delete-goal"], ["fa", "fa-times"], 'deleteGoal(' + "'"+goalId+"'" + ')');
        goalList.appendChild(goal);
    }

}


// UPDATE CONTENT IN FIRESTORE
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
    const startIdx = id.lastIndexOf("-");
    const goalCardNum = id.substring(startIdx+1);

    goalToDelete.remove();
    /*db.collection('mentorship').doc(mentorshipID).collection("goals").updateData() {
        
        snapshot.docs.forEach(goalDocument => { // There should be just one goal document
            goalDocument.update({
                //goalCards.goals[goalCardNum]: firebase.firestore.FieldValue.delete()
            });
        });
    });*/
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
    icon.setAttribute("onclick",onclickFunc);
    button.appendChild(icon);
    parent.appendChild(button);
}



// add a checkbox to an individual goal
function addCheckBox(goal, content, checked) {
    const checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');

    const label = document.createElement('label');

    if (!checked) {
        label.classList.add("enter-leave");
        label.setAttribute("onclick", "selectText()");
        label.setAttribute("contenteditable", "true");
    } else {
        checkBox.checked = true;
    }
    
    label.innerText = content;
    goal.appendChild(checkBox);
    goal.appendChild(label);
}

// create a new goal with checkbox and delete button
function createNewGoal(goalListId) {
    console.log("I'm creating a new goal");
    const goalList = document.getElementById(goalListId);
    const goal = document.createElement('li');
    addCheckBox(goal, "This is for new parameter for addCheckBox", false);
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