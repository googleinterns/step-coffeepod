// REPLACE WITH CURRENT USER'S ID
const mentorshipID = "302vr6Tmw8t96kO5Ccof";

// asynchronous work

function getGoalCards() {
    db.collection('mentorship').doc(mentorshipID).collection("goals").orderBy("timestamp", "desc").get().then((snapshot) => {
        // allGoalCards is an array of goalCards
        const allGoalCards = [];
        const goalCardsIds = [];
        snapshot.docs.forEach(goalDocument => { // There should be just one goal document
            allGoalCards.push(goalDocument.data());

            // Get the ids to make sure the ids and the goal cards sync after deletion
            goalCardsIds.push(goalDocument.id);
        });
        putGoalCardsOnPage(allGoalCards, goalCardsIds);
    });
}


// PUT THINGS FROM FIRESTORE ONTO PAGE
function loadData() {
    getGoalCards();
}

// add goalCardOutline, goalCardContent to a one full GoalCard and add it to the board of cards

function addComponentsGoalCard (title, checkedGoals,uncheckedGoals, goalCardId) {
    const goalCard = addOutlineGoalCard(goalCardId);
    const goalContent = addGoalCardContent(title, checkedGoals, uncheckedGoals, goalCardId);
    goalCard.appendChild(goalContent);
}

function putGoalCardsOnPage(allGoalCards, goalCardsIds) {
    // Retrieve element in reverse chronological order 
    // (most updated element show up first because they are added to the back of an array)
    for (i = 0; i  < allGoalCards.length; i++) {
        const title = allGoalCards[i].title;
        const checkedGoals = allGoalCards[i].checked;
        const uncheckedGoals = allGoalCards[i].unchecked;
        // make Id num consistent with goalCardId
        addComponentsGoalCard(title, checkedGoals, uncheckedGoals, goalCardsIds[i]);
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

function createGoalCardTitle(title, goalTitleId) {
    const goalCardTitle = document.createElement('p');
    goalCardTitle.classList.add("card-title", "enter-leave");
    goalCardTitle.setAttribute("id", goalTitleId);
    goalCardTitle.setAttribute('contenteditable', 'true');
    goalCardTitle.setAttribute('onclick', "selectText()");
    goalCardTitle.innerText = title;

    return goalCardTitle;
}

function createGoalCardBodyWithAddButton (goalCardId, goalUncheckedListId) {
    const goalCardBody = document.createElement('div');
    goalCardBody.setAttribute("class", "card-body");
    goalCardBody.setAttribute("id", "body-" + goalCardId);
    addButton(goalCardBody,["btn", "float-right"], ["fas", "fa-plus"], "createNewGoal("+ "'" + goalUncheckedListId + "'" +")");
    return goalCardBody;
}

function createElement(tag, classList, id, withId) {
    const element = document.createElement(tag);
    for (className of classList) {
        element.classList.add(className);
    }

    if (withId) {
        element.setAttribute("id", id);
    } 
    return element;
}

function addGoalCardContent(title, checkedGoals, uncheckedGoals, goalCardId) {
    const goalCheckedListId = "goal-checked-list-" + goalCardId;
    const goalUncheckedListId = "goal-unchecked-list-" + goalCardId;
    const goalTitleId = "goal-title-" + goalCardId;

    const goalContent = createElement('div',["card", "goal-card"], "", false);

    const goalCardBody = createGoalCardBodyWithAddButton (goalCardId, goalUncheckedListId);
    const goalCardTitle = createGoalCardTitle(title, goalTitleId);
    goalCardBody.appendChild(goalCardTitle);

    const goalListDiv = createElement('div',["goals"], "", false);

    const goalUncheckedList = createElement('ul', [], goalUncheckedListId, true);
    const goalCheckedList = createElement('ul', [], goalCheckedListId, true);

    addGoals(uncheckedGoals, goalUncheckedList, false);
    addGoals(checkedGoals, goalCheckedList, true);

    const lineBreak = document.createElement('hr');
    goalListDiv.appendChild(goalUncheckedList);

    if (goalCheckedList.hasChildNodes()) {
        goalListDiv.appendChild(lineBreak);
    }
    
    goalListDiv.appendChild(goalCheckedList);
    goalCardBody.appendChild(goalListDiv);

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



function createNewGoalCard() {
        // push goal card into firestore
        db.collection('mentorship').doc(mentorshipID).collection("goals").add({
            checked: [],
            unchecked: [],
            title: "New Title",
            timestamp: Date.now()
        }).then (function(newDocRef) {
             // Put this on the page
            const goalCardId = newDocRef.id;
            addComponentsGoalCard ("New Title", [], [], goalCardId);

        });
}

// Get selected text 
function getSelectedText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

/*$(".enter-leave").click(function(){
    $(this).data('clicked', true);
});*/

function addCurrentElementToFirestore(element) {
    const goalId = element.id;
    let goalCardId

        if (goalId.includes("checked")) {
            goalCardId = getGoalCardId(element.parentNode.id);
        } else {
            goalCardId = element.parentNode.id.substring(element.parentNode.id.indexOf("-")+1);
        }
        
        
        const oldContent =  document.getElementById(goalId).getAttribute("data-init");
        
        // set new attribute to make sure nothing is confused
        document.getElementById(goalId).setAttribute("data-init", this.innerText);
        const goalCardRef = db.collection('mentorship').doc(mentorshipID).collection("goals").doc(goalCardId);


        // for individual goals
        if (goalId.includes("checked")) {

            goalCardRef.update({ 
                unchecked: firebase.firestore.FieldValue.arrayUnion(element.innerText)
            });
            goalCardRef.update({ 
                unchecked: firebase.firestore.FieldValue.arrayRemove(oldContent)
            });
        } else { // for title

            goalCardRef.update({ 
                "title": element.innerText
            });
        }
}

$(document).on("click", '.enter-leave', function(event) {
    const currentElement = this;

    window.addEventListener('click', function(e){   
    if (!currentElement.contains(e.target)){
        addCurrentElementToFirestore(currentElement);

        }
    });
});


// Enter and leave the contenteditable area which works for dynamically added elements
$(document).on("keypress", '.enter-leave', function(e) {
    var keyC = e.keyCode;

    if (keyC == 13) {
        $(this).blur().next().focus();
        addCurrentElementToFirestore(this);
        return false;

    }
});


function getGoalCardId(goalId) {
    const endIdx = goalId.lastIndexOf("-");
    const containsGoalCardNum = goalId.substring(0, endIdx);
    const startIdx = containsGoalCardNum.lastIndexOf("-");
    const goalCardId = containsGoalCardNum.substring(startIdx + 1);
    return goalCardId;
}

// call a function to delete a goal
function deleteGoal(goalId) {
    //Delete from DOM
    const goalToDelete = document.getElementById(goalId);
    const goalCardId = getGoalCardId(goalId)

    goalToDelete.remove();

    //Delete from database
    if (goalId.includes('unchecked')) {
         db.collection('mentorship').doc(mentorshipID).collection("goals").doc(goalCardId).update({ 
        unchecked: firebase.firestore.FieldValue.arrayRemove(goalToDelete.innerText)
        });
    } else {
        db.collection('mentorship').doc(mentorshipID).collection("goals").doc(goalCardId).update({ 
        checked: firebase.firestore.FieldValue.arrayRemove(goalToDelete.innerText)
        });
    }
}

// delete a goal card
function deleteGoalCard(goalCardId) {
    const goalCard = document.getElementById(goalCardId);
    goalCard.remove();

    //delete goal card from firestore
    db.collection('mentorship').doc(mentorshipID).collection("goals").doc(goalCardId).delete();
}

// add a button to some parent with some classes and some onclick function
function addButton(parent, buttonClasses, iconClasses, onclickFunc) {
    const button = document.createElement('button');

    // use spread to add multiple classes
    button.classList.add(...buttonClasses);

    const icon = document.createElement('i');
    icon.classList.add(...iconClasses);

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
        label.setAttribute("id", "content-" + goal.id);
        label.setAttribute("onclick", "selectText()");
        label.setAttribute("contenteditable", "true");
        label.setAttribute("data-init", content);
    } else {
        checkBox.checked = true;
    }
    
    label.innerText = content;
    goal.appendChild(checkBox);
    goal.appendChild(label);
}

// create a new goal with checkbox and delete button
function createNewGoal(goalUncheckedListId) {
    const goalList = document.getElementById(goalUncheckedListId);
    const numUncheckedGoals = goalList.getElementsByTagName("li").length;
    const goalId = "goal-unchecked-" +  goalUncheckedListId.substring(goalUncheckedListId.lastIndexOf("-")) + "-" +  numUncheckedGoals;
    const goalCardId = getGoalCardId(goalId);
    const goal = document.createElement('li');

    goal.setAttribute("id", goalId);
    addCheckBox(goal, "New Goal", false);
    addButton(goal, ["btn", "btn-goal",  "delete-goal"], ["fa", "fa-times"], 'deleteGoal(' + "'"+goalId+"'" + ')');

    goalList.appendChild(goal);

    // Update in firestore
    db.collection('mentorship').doc(mentorshipID).collection("goals").doc(goalCardId).update({ 
        unchecked: firebase.firestore.FieldValue.arrayUnion(goal.innerText)
    });
}

// when the user clicks on text, it selects all
function selectText() {
  document.execCommand('selectAll', false, null);
};

// move goal to check or unchecked list depending on whether the checkbox is checked or not 
function moveGoal(goalId){
    console.log(goalId);
    console.log(document.getElementById(goalId).children[0]);
    console.log(document.getElementById(goalId).children[0].checked);
}

