


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


function createNewGoal() {
	const goalBoard = document.getElementById("goal-board");
	console.log(document.getElementById("goal-board"));
	const goalCard = document.createElement('div');
	goalCard.classList.add("col-auto", "mb-3");

	goalBoard.appendChild(goalCard);

	const goalContent = document.createElement('div');
	goalContent.classList.add("card", "goal-card");

	goalCard.appendChild(goalContent);

	goalContent.innerHTML = ' <div id="goal-body" class="card-body"> <button id="add-goals" class="btn float-right grayText"><i class="fas fa-plus" aria-hidden="true" onclick="createNewGoal()"></i></button> \
	<p class="poppins weight600 font20 line25 orangeTextLight capitalize">First Goals</p> \
	</div>';

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
