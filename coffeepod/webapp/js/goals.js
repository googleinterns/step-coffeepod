// REPLACE WITH CURRENT USER'S ID
const mentorshipID = "302vr6Tmw8t96kO5Ccof";

// asynchronous work

function getGoalCards() {
    db.collection('mentorship').doc(mentorshipID).collection("goals").orderBy("timestamp", "asc").get().then((snapshot) => {
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
    goalBoard.prepend(goalCard);
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
    const goalCheckedListId = "goal-checked-" + goalCardId;
    const goalUncheckedListId = "goal-unchecked-" + goalCardId;
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
    lineBreak.setAttribute("id", "line-break-" + goalCardId);
    console.log(lineBreak.id);

    goalListDiv.appendChild(goalUncheckedList);
    goalListDiv.appendChild(lineBreak);

    if (!goalCheckedList.hasChildNodes()) {
        lineBreak.style.display = "none";
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
    console.log("num card is: " + numCard);
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
    console.log("I need to add this current element to firestore");
    const goalId = element.id;
    let goalCardId

        if (goalId.includes("checked")) {
            goalCardId = getGoalCardId(element.parentNode.id);
        } else {
            goalCardId = element.parentNode.id.substring(element.parentNode.id.indexOf("-")+1);
        }
        
        
        const oldContent =  document.getElementById(goalId).getAttribute("data-init");
        console.log("old content is: " + oldContent);
        console.log("content to be added is: " + element.innerText);

        // set new attribute to make sure nothing is confused
        document.getElementById(goalId).setAttribute("data-init", element.innerText);
        const goalCardRef = db.collection('mentorship').doc(mentorshipID).collection("goals").doc(goalCardId);


        // for individual goals
        if (goalId.includes("checked")) {
            goalCardRef.update({ 
                unchecked: firebase.firestore.FieldValue.arrayRemove(oldContent)
            });

            goalCardRef.update({ 
                unchecked: firebase.firestore.FieldValue.arrayUnion(element.innerText)
            });
            
        } else { // for title

            goalCardRef.update({ 
                "title": element.innerText
            });
        }
}

/*$(document).on("click", '.enter-leave', function(event) {
    const currentElement = event.target;

    window.addEventListener('click', function(e){   
    if (!currentElement.contains(e.target)){
        addCurrentElementToFirestore(currentElement);

        }
    });
});*/


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
    checkBox.setAttribute('onclick', 'moveGoal(' + "'" + goal.id + "'" + ')');

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
    const goalId = "goal-unchecked-" +  goalUncheckedListId.substring(goalUncheckedListId.lastIndexOf("-") + 1) + "-" +  numUncheckedGoals;
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

// find out whether current id indicates checked or unchecked goals/ goal lists
function getOtherListId(currentListId) {

    const firstDash = currentListId.indexOf("-");
    const lastDash = currentListId.lastIndexOf("-");

    const checkedOrUnchecked = currentListId.substring(firstDash + 1, lastDash);


    // check what current list id is
    const checked = !checkedOrUnchecked.includes("unchecked")

    let adding;

    if (checked) {
        adding = 'unchecked';
    } else {
        adding = 'checked';
    }
    const otherListId = "goal-" + adding + "-" + currentListId.substring(lastDash+1);
    return otherListId;
}

// get goal count by checking the last goal id of the destination list and add 1 to that
function getGoalCount(destinationElementId){
    const goalList = document.getElementById(destinationElementId);
    if (goalList.hasChildNodes()) {
        const lastElement = goalList.lastElementChild;
        console.log("last element is: " + lastElement.id);
        console.log("the id number of the last goal of the destination section is");
        console.log(lastElement.id.substring(lastElement.id.lastIndexOf("-") + 1));
        const newGoalCount = parseInt(lastElement.id.substring(lastElement.id.lastIndexOf("-") + 1)) + 1;
        return newGoalCount;
    }

    return 0;
    
}

// move goal to check or unchecked list depending on whether the checkbox is checked or not 
function moveGoal(goalId){

    const liGoalElement = document.getElementById(goalId);
    const checkBox = liGoalElement.children[0];
    const checked = checkBox.checked;
    const label = liGoalElement.children[1];
    const deleteButton = liGoalElement.children[2].children[0];
    const currentListId = goalId.substring(0, goalId.lastIndexOf("-"));
    const goalCardId = getGoalCardId(goalId);
    const otherListId = getOtherListId(currentListId);
    const newGoalId = otherListId + "-" + getGoalCount(otherListId);
    const lineBreak = document.getElementById('line-break-' + goalCardId);

    console.log('Considering element: ' + liGoalElement.id);
    console.log('New element id is:' + newGoalId);
    console.log('Line break id is: ' + lineBreak);


    if (checked) {// move from unchecked to checked list
        
        // there are currently no elements in unchecked list
        if (!document.getElementById(otherListId).hasChildNodes()) {
            lineBreak.style.display = "block";
        }

        // no longer allow editable content
        label.removeAttribute('onclick');
        label.setAttribute('contenteditable', 'false');

        // move the element to a new div in HTML dom

        document.getElementById(currentListId).removeChild(liGoalElement);
        document.getElementById(otherListId).appendChild(liGoalElement);

        //set new id after moving 

        liGoalElement.setAttribute("id", newGoalId);
        checkBox.setAttribute('onclick', 'moveGoal(' + "'" + newGoalId + "'" + ")");

        // also need to set new id for the delete button
        deleteButton.setAttribute('onclick', 'deleteGoal(' + "'" + newGoalId + "'" + ')');

        // REFLECT THE CHANGE IN FIREBASE

        const goalCardRef = db.collection('mentorship').doc(mentorshipID).collection("goals").doc(goalCardId);

        // for individual goals
        goalCardRef.update({ 
            unchecked: firebase.firestore.FieldValue.arrayRemove(label.innerText)
        });

        goalCardRef.update({ 
            checked: firebase.firestore.FieldValue.arrayUnion(label.innerText)
        });
            

    } else {
        console.log("the goal is no longer checked");
        label.setAttribute('contenteditable', 'true');
        label.setAttribute('onclick', 'selectText()');

        // the current element to be moved to unchecked is the only element in checked
        document.getElementById(currentListId).removeChild(liGoalElement);
        if (!document.getElementById(currentListId).hasChildNodes()) {
            const lineBreak = document.getElementById('line-break-' + goalCardId);
            lineBreak.style.display = "none";
        }

        document.getElementById(otherListId).appendChild(liGoalElement);

        liGoalElement.setAttribute("id", newGoalId);
        checkBox.setAttribute('onclick', 'moveGoal(' + "'" + newGoalId + "'" + ")");
        deleteButton.setAttribute('onclick', 'deleteGoal(' + "'" + newGoalId + "'" + ')');

        const goalCardRef = db.collection('mentorship').doc(mentorshipID).collection("goals").doc(goalCardId);

        // move from checked to unchecked
        goalCardRef.update({ 
            checked: firebase.firestore.FieldValue.arrayRemove(label.innerText)
        });

        goalCardRef.update({ 
            unchecked: firebase.firestore.FieldValue.arrayUnion(label.innerText)
        });
            
    }
}