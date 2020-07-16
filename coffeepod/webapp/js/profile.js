let name, email, uid, user, username;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const open = urlParams.get('user');
console.log(open);

// this function loads in the profile based on the person who is logged in
function getProfile() {
  if(open == null) {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        name = user.displayName;
        email = user.email;
        uid = user.uid;
        let userRef = db.collection("user-info").doc(uid);
        userRef.get().then(function(userinfo) {
          username = userinfo.data().username;
        });
        let profileRef = db.collection("profile").doc(uid);
        profileRef.get().then(function(profile) {
          if (profile.exists) {
            loadExperience();
            loadEducation();
            updatePage(profile);
            updateUsername();
            loadGoals(profile);
            loadFinished(profile);
          } else {
            // doc.data() will be undefined in this case
            console.log("No such profile!");
          }
        }).catch(function(error) {
          console.log("Error getting profile:", error);
        });
      } else {
        console.log("not logged in");
      }
    });
  } else {
    // load someone elses page
  }
  resizeAllTextarea();
}

// this puts the about section into edit mode
function updateAbout() {
  document.getElementById("updateAbt").classList.add("hidden");
  document.getElementById("saveAbt").classList.remove("hidden");
  document.getElementById("aboutText").disabled = false;
}

// load in the username on the page
function updateUsername() {
  let usernameSlots = document.getElementsByClassName("username");
  for (let i = 0, len = usernameSlots.length; i < len; i++) {
    usernameSlots[i].innerText = username;
  }

}

// save the edits made to the about section
function saveAbout() {
  document.getElementById("saveAbt").classList.add("hidden");
  document.getElementById("updateAbt").classList.remove("hidden");
  document.getElementById("aboutText").disabled = true;
  firebase.firestore().collection('profile').doc(uid).update({ 
    about: document.getElementById("aboutText").value
  });
}

// this puts the experience section into edit mode
function updateExperience() {
  document.getElementById("updateExp").classList.add("hidden");
  document.getElementById("saveExp").classList.remove("hidden");
  document.getElementById("addExp").classList.remove("hidden");
  let elements = document.getElementsByClassName("experienceFrom");
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
  let deleteBut = document.getElementsByClassName("deleteExp");
  for (let i = 0, len = deleteBut.length; i < len; i++) {
    deleteBut[i].classList.remove("hidden");
  }
}


// save the edits made to the experience section
function saveExperience() {
  document.getElementById("saveExp").classList.add("hidden");
  document.getElementById("addExp").classList.add("hidden");
  document.getElementById("updateExp").classList.remove("hidden");
  let elements = document.getElementsByClassName("experienceFrom");
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
  let deleteBut = document.getElementsByClassName("deleteExp");
  for (let i = 0, len = deleteBut.length; i < len; i++) {
    deleteBut[i].classList.add("hidden");
  }
  saveEachExperience();
}

// put the education section into the edit mode
function updateEducation() {
  document.getElementById("updateEdu").classList.add("hidden");
  document.getElementById("saveEdu").classList.remove("hidden");
  document.getElementById("addEdu").classList.remove("hidden");
  let elements = document.getElementsByClassName("educationForm");
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
  let deleteBut = document.getElementsByClassName("deleteEdu");
  for (let i = 0, len = deleteBut.length; i < len; i++) {
    deleteBut[i].classList.remove("hidden");
  }
}

// method user to put the goal section into update mode
function updateGoal() {
  document.getElementById("updatePen").classList.add("hidden");
  let elements = document.getElementsByClassName("updateGoal");
  for(let i = 0, len = elements.length; i < len; i++) {
    elements[i].classList.remove("hidden");
  }
}

// method user to put the goal sectin into default mode
function saveGoal() {
  document.getElementById("updatePen").classList.remove("hidden");
  let elements = document.getElementsByClassName("updateGoal");
  for(let i = 0, len = elements.length; i < len; i++) {
    elements[i].classList.add("hidden");
  }
}

// method user to put the finished section into update mode
function updateFinished() {
  document.getElementById("updateFinishedPen").classList.add("hidden");
  let elements = document.getElementsByClassName("updateFinished");
  for(let i = 0, len = elements.length; i < len; i++) {
    elements[i].classList.remove("hidden");
  }
}

// method user to put the finished sectin into default mode
function saveFinished() {
  document.getElementById("updateFinishedPen").classList.remove("hidden");
  let elements = document.getElementsByClassName("updateFinished");
  for(let i = 0, len = elements.length; i < len; i++) {
    elements[i].classList.add("hidden");
  }
}

// delete the experience that called this function
function deleteExp(button) {
  let form = button.closest('.formTempExp');
  let id = form.id;
  form.remove();
  db.collection("profile").doc(uid).collection("experience").doc(id).delete();
}

// delete the education that called this function
function deleteEdu(button) {
  let form = button.closest('.formTempEdu');
  let id = form.id;
  form.remove();
  db.collection("profile").doc(uid).collection("education").doc(id).delete();
}

// save the edits made to the education mode
function saveEducation() {
  document.getElementById("saveEdu").classList.add("hidden");
  document.getElementById("addEdu").classList.add("hidden");
  document.getElementById("updateEdu").classList.remove("hidden");
  let elements = document.getElementsByClassName("educationForm");
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
  let deleteBut = document.getElementsByClassName("deleteEdu");
  for (let i = 0, len = deleteBut.length; i < len; i++) {
    deleteBut[i].classList.add("hidden");
  }
  saveEachEducation();
}

// put the header into edit mode
function updateHead() {
  document.getElementById("updateHd").classList.add("hidden");
  document.getElementById("saveHd").classList.remove("hidden");
  let elements = document.getElementsByClassName("headForm");
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
}

// save the edits made to the header
function saveHead() {
  document.getElementById("saveHd").classList.add("hidden");
  document.getElementById("updateHd").classList.remove("hidden");
  let elements = document.getElementsByClassName("headForm");
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
  firebase.firestore().collection('profile').doc(uid).update({ 
    title: document.getElementById("title").value,
    location: document.getElementById("location").value
  });
}

// update the profile page with information from firebase
function updatePage(profile) {
  let abtText = document.getElementById("aboutText");
  abtText.value = profile.data().about;
  document.getElementById("name").innerText = profile.data().name;
  document.getElementById("title").innerText = profile.data().title;
  document.getElementById("location").innerText = profile.data().location;
}

// add in all the experience from firebase
function loadExperience() {
  db.collection("profile").doc(uid).collection("experience").where("filled", "==", true).get().then(querySnapshot => {
    querySnapshot.forEach(experience => {
      let form = makeExpForm();
      form.querySelector(".company").innerText = experience.data().company;
      form.querySelector(".date").innerText = experience.data().date;
      form.querySelector(".title").innerText = experience.data().title;
      form.querySelector(".about").innerText = experience.data().about;
      form.id = experience.id;
    });
  });  
}

// add in all the education from firebase
function loadEducation() {
  db.collection("profile").doc(uid).collection("education").where("filled", "==", true).get().then(querySnapshot => {
    querySnapshot.forEach(education => {
      let form = makeEduForm();
      form.querySelector(".school").innerText = education.data().school;
      form.querySelector(".date").innerText = education.data().date;
      form.querySelector(".degree").innerText = education.data().degree;
      form.id = education.id;
    });
  });  
}

// save all the experience to firebase
function saveEachExperience() {
  let cont = document.getElementById("expCont");
  let forms = cont.children;
  for(let form of forms) {
    firebase.firestore().collection('profile').doc(uid).collection("experience").doc(form.id).update({ 
      about: form.querySelector(".about").value,
      title: form.querySelector(".title").value,
      date: form.querySelector(".date").value,
      company: form.querySelector(".company").value
    });
  }
}

// save all the education to firebase
function saveEachEducation() {
  let cont = document.getElementById("eduCont");
  let forms = cont.children;
  for(let form of forms) {
    firebase.firestore().collection('profile').doc(uid).collection("education").doc(form.id).update({ 
      school: form.querySelector(".school").value,
      degree: form.querySelector(".degree").value,
      date: form.querySelector(".date").value,
    });
  }
}

// function to load the goals from firebase
function loadGoals(profile) {
  let goals = profile.data().goals;
  for(let i = 0, len = goals.length; i < len; i++) {
    loadGoal(goals[i], "myUL", "updateGoal");
  }
}

//function to load the finished goals from firebase
function loadFinished(profile) {
  let goals = profile.data().finished;
  for(let i = 0, len = goals.length; i < len; i++) {
    loadGoal(goals[i], "finishedUL", "updateFinished");
  }
}

// function to resize an object based on the content inside of it
function resize(resizeObj) {
  resizeObj.style.height = (resizeObj.scrollHeight+10)+'px';
}

// add a form to the experience section so the user can add a new setion
function addExpForm() {
  let clone = makeExpForm();
  // resize the textareas
  resizeAllTextarea();
  db.collection('profile').doc(uid).collection('experience').add ({
    filled: true,
    company: "",
    date: "",
    title: "",
    about: ""
  })
  .then(function(docRef) {
    clone.id = docRef.id;
  });  
}

// add a form to the education section so the user can add a new setion
function addEduForm() {
  let clone = makeEduForm();
  // resize the textareas
  resizeAllTextarea();
  db.collection('profile').doc(uid).collection('education').add ({
    filled: true,
    school: "",
    date: "",
    degree: ""
  })
  .then(function(docRef) {
    clone.id = docRef.id;
  });  
}

// makes a new form for the experience 
function makeExpForm() {
  let form = document.getElementById("expFrom");
  let clone = form.cloneNode(true);
  clone.style.display = "block";
  let cont = document.getElementById("expCont");
  cont.appendChild(clone);
  return clone;
}

// makes a new form for the education section
function makeEduForm() {
  let form = document.getElementById("eduFrom");
  let clone = form.cloneNode(true);
  clone.style.display = "block";
  let cont = document.getElementById("eduCont");
  cont.appendChild(clone);
  return clone;
}

// makes all textareas fit the content they hold
function resizeAllTextarea() {
  $("textarea").each(function () {
    this.style.height = (this.scrollHeight+10)+'px';
  });
}



// // Add a "checked" symbol when clicking on a list item
// let list = document.getElementById('myUL');
// list.addEventListener('click', function(ev) {
//   if (ev.target.tagName === 'LI') {
//     ev.target.classList.toggle('checked');
//   }
// }, false);

// Create a new list item when clicking on the "Add" button
function newElement() {
  let li = document.createElement("li");
  li.classList.add("goal");
  let inputValue = document.getElementById("myInput").value;
  li.innerText = inputValue;
  const deleteButtonElement = document.createElement('i');
  deleteButtonElement.classList.add("deleteGoal", "updateGoal");
  const deleteIcon = document.createElement('i');
  deleteIcon.className = "fas fa-times";
  deleteButtonElement.addEventListener('click', () => {
    // Remove the task from the DOM.
    li.remove();
  });
  deleteButtonElement.appendChild(deleteIcon);
  li.appendChild(deleteButtonElement);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
    firebase.firestore().collection('profile').doc(uid).update({ 
      goals: firebase.firestore.FieldValue.arrayUnion(inputValue)
    });
  }
  document.getElementById("myInput").value = "";
}

// method used to load the data from the data store into a li in the goal section
function loadGoal(value, parentID, classAdd) {
  let li = document.createElement("li");
  li.classList.add("goal");
  li.innerText = value;
  document.getElementById(parentID).appendChild(li);
  const deleteButtonElement = document.createElement('i');
  deleteButtonElement.classList.add("deleteGoal", "hidden", classAdd);
  const deleteIcon = document.createElement('i');
  deleteIcon.className = "fas fa-times";
  deleteButtonElement.addEventListener('click', () => {
    if(li.parentElement.id == "myUL") {
      moveToDone(li);
    } else {
      deleteGoal(li);
    }
  });
  deleteButtonElement.appendChild(deleteIcon);
  li.appendChild(deleteButtonElement);
}

// move a goal to the finished goals 
function moveToDone(li) {
  let clone = li.cloneNode(true);
  li.remove();
  console.log(li.innerText);
  document.getElementById("finishedUL").appendChild(clone);
  console.log(clone.children);
  clone.children[0].classList.remove("updateGoal");
  clone.children[0].classList.add("updateFinished", "hidden");
  // delete it from the goals list
  firebase.firestore().collection('profile').doc(uid).update({ 
    goals: firebase.firestore.FieldValue.arrayRemove(li.innerText)
  });
  firebase.firestore().collection('profile').doc(uid).update({ 
    finished: firebase.firestore.FieldValue.arrayUnion(li.innerText)
  });
}

// get rid of the goal from firebase to delete it
function deleteGoal(li) {
  li.remove();
  firebase.firestore().collection('profile').doc(uid).update({ 
    finished: firebase.firestore.FieldValue.arrayRemove(li.innerText)
  });
}

//  // Create a "close" button and append it to each list item
//   const myNodelist = document.getElementsByClassName("goal");
//   console.log(myNodelist);
//   console.log(myNodelist.length);
//   for (let i = 0; i < myNodelist.length; i++) {
//     console.log(myNodelist[i]);
//     let span = document.createElement("SPAN");
//     let txt = document.createTextNode("\u00D7");
//     span.className = "close";
//     span.appendChild(txt);
//     console.log("Adding" + span);
//     myNodelist[i].appendChild(span);
//   }

//   // Click on a close button to hide the current list item
//   let close = document.getElementsByClassName("close");
//   // console.log(close);
//   let i;
//   for (i = 0; i < close.length; i++) {
//     close[i].onclick = function() {
//       let div = this.parentElement;
//       div.style.display = "none";
//     }
//   }