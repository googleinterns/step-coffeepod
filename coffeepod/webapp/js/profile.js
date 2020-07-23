let name, email, uid, user, username, mentors, mentees, personal;
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let open = urlParams.get('user');

// this function loads in the profile based on the person who is logged in
function getProfile() {
  if(open == null) {
    personal = true;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        name = user.displayName;
        email = user.email;
        uid = user.uid;
        loadData();
      } else {
        console.log("not logged in");
      }
    });
  } else {
    // load someone elses page
    uid = open;
    personal = false;
    let userRef = db.collection("user-info").doc(uid);
    userRef.get().then(function(userinfo) {
      name = userinfo.data().name;
      email = userinfo.data().email;
    }).then(loadData());
  }
  resizeAllTextarea();
}

// check if we should hide the goals and disable the buttons when someone is looking at another persons page
function checkPersonal() {
  if(personal) {
    document.getElementById("goalCol").classList.add("d-xl-block");
    let notPersonal = document.getElementsByClassName("nonPersonal");
    for(let i = 0; i < notPersonal.length; i ++) {
      notPersonal[i].classList.add("hidden");
    }
    let buttons = document.getElementsByClassName("update");
    for(let i = 0; i < buttons.length; i ++) {
      buttons[i].classList.remove("hidden");
    }
  } else {
    let buttons = document.getElementsByClassName("update");
    for(let i = 0; i < buttons.length; i ++) {
      buttons[i].classList.add("hidden");
    }
  }
}

// load the personal data based on the uid of the page we are trying to get
function loadData() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      if(user.uid == uid) {
        // this is actually their own page
        personal = true;
        checkPersonal()
      }
    }
  })
  let userRef = db.collection("user-info").doc(uid);
  userRef.get().then(function(userinfo) {
    username = userinfo.data().username;
    mentors = userinfo.data().mentors;
    mentees = userinfo.data().mentees;
    loadMentors(mentors, "mentorStore");
    loadMentors(mentees, "menteeStore");
    if(mentors.length == 0) {
      document.getElementById("mentorTitle").classList.add("hidden");
      document.getElementById("mentorStore");
    }
    if(mentees.length == 0) {
      document.getElementById("menteeTitle").classList.add("hidden");
      document.getElementById("menteeStore");
    }
    if(personal && mentees.length == 0 && mentors.length == 0) {
      document.getElementById("promptMentor").classList.remove("hidden");
    }
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
      loadTags(profile);
      loadAsked();
      loadFollowing(profile.data().following);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such profile!");
    }
  }).catch(function(error) {
    console.log("Error getting profile:", error);
  });
}
// load mentors to the page
function loadMentors(list, store) {
  for(var i = 0; i < list.length; i++) {
    makeMentorCard(list[i], store);
  }
}

// load the asked questions to the profile
function loadAsked() {
  document.getElementById("askedStore").innerText = "";
  db.collection("forum").where("userID", "==", uid).get().then(querySnapshot => {
    querySnapshot.forEach(question => {
      makeQuestion(question.id, "askedStore");
    });
  });  
   db.collection("comments").where("userID", "==", uid).get().then(querySnapshot => {
    querySnapshot.forEach(comment => {
      makeQuestion(comment.data().postID, "askedStore");
    });
  });  
}

// load the following questsion to the profile
function loadFollowing(following) {
  document.getElementById("followedStore").innerText = "";
  for(let i = 0; i < following.length; i++) {
    makeQuestion(following[i], "followedStore");
  }
}

// function to make the question to be filled into the profile
function makeQuestion(postID, store) {
  let temp = document.getElementById("questionTemplate");
  let clone = temp.cloneNode(true);
  clone.classList.remove("hidden");
  let postRef = db.collection("forum").doc(postID);
  clone.querySelector(".follow").id = postID;
  checkFollowOne(clone.querySelector(".follow"), true);
  clone.querySelector(".seeMore").setAttribute('href', '/index-ind.html?id=' + postID);
  postRef.get().then(function(postinfo) {
    let userRef = db.collection("profile").doc(postinfo.data().userID);
    clone.querySelector(".date").innerText = postinfo.data().date;
    clone.querySelector(".question").innerText = postinfo.data().title;
    clone.querySelector(".content").innerText = postinfo.data().content;
    userRef.get().then(function(userinfo) {
      clone.querySelector(".name").innerText = userinfo.data().name;
      clone.querySelector(".title").innerText = userinfo.data().title;
    });
  });
  document.getElementById(store).appendChild(clone);
}

// this puts the about section into edit mode
function updateAbout() {
  document.getElementById("updateAbt").classList.add("hidden");
  document.getElementById("saveAbt").classList.remove("hidden");
  document.getElementById("aboutText").disabled = false;
}

// this puts the tag section into edit mode
function updateTags() {
  document.getElementById("updateTag").classList.add("hidden");
  document.getElementById("saveTag").classList.remove("hidden");
  document.getElementById("tagList").classList.remove("hidden");
  let elements = document.getElementsByClassName("tag");
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
}

// load in the username on the page
function updateUsername() {
  let usernameSlots = document.getElementsByClassName("username");
  for (let i = 0, len = usernameSlots.length; i < len; i++) {
    usernameSlots[i].innerText = name;
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
  if(personal) {
    if(document.getElementById("aboutText").value == "") {
      document.getElementById("promptAbt").classList.remove("hidden");
    } else {
      document.getElementById("promptAbt").classList.add("hidden");
    }
  }
}

// save the edits made to the tags
function saveTags() {
  document.getElementById("updateTag").classList.remove("hidden");
  document.getElementById("saveTag").classList.add("hidden");
  document.getElementById("tagList").classList.add("hidden");
  let elements = document.getElementsByClassName("tag");
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
  let tags = document.getElementsByClassName("tag");
  let tagList = [];
  let store = document.getElementById("tagStore");
  while (store.firstChild) {
    store.removeChild(store.firstChild);
  }
  for(let i = 0; i < tags.length; i++) {
    if(tags[i].checked == true) {
      tagList.push(tags[i].id);
      makeTag(tags[i]);
    }
  }
  firebase.firestore().collection('profile').doc(uid).update({ 
    tags: tagList,
    tagSize: tagList.length
  });
  if(personal && tagList.length != 0) {
    document.getElementById("promptTag").classList.add("hidden");
  } else {
    document.getElementById("promptTag").classList.remove("hidden");
  }
}

// make the tag for the profile
function makeTag(checkElement) {
  let store = document.getElementById("tagStore");
  var tagBut = document.createElement("div");
  tagBut.classList.add("tagList");
  var what = document.createElement("p");
  what.classList.add("padNormal");
  what.innerText = checkElement.parentNode.textContent.replace(/(\r\n|\n|\r)/gm, "");
  tagBut.appendChild(what);
  store.appendChild(tagBut);
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
  if(document.getElementById("expCont").childNodes.length == 0 && personal) {
    document.getElementById("promptExper").classList.remove("hidden");
  }
}

// delete the education that called this function
function deleteEdu(button) {
  let form = button.closest('.formTempEdu');
  let id = form.id;
  form.remove();
  db.collection("profile").doc(uid).collection("education").doc(id).delete();
  if(document.getElementById("eduCont").childNodes.length == 0  && personal) {
    document.getElementById("promptEdu").classList.remove("hidden");
  }
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
  if(abtText.value == "" && personal) {
    document.getElementById("promptAbt").classList.remove("hidden");
  }
  document.getElementById("name").innerText = profile.data().name;
  document.getElementById("title").innerText = profile.data().title;
  document.getElementById("location").innerText = profile.data().location;
}

// add in all the experience from firebase
function loadExperience() {
  let count = 0;
  db.collection("profile").doc(uid).collection("experience").where("filled", "==", true).get().then(querySnapshot => {
    querySnapshot.forEach(experience => {
      count++;
      let form = makeExpForm();
      form.querySelector(".company").innerText = experience.data().company;
      form.querySelector(".date").innerText = experience.data().date;
      form.querySelector(".title").innerText = experience.data().title;
      form.querySelector(".about").innerText = experience.data().about;
      form.id = experience.id;
    });
    if(count == 0 && personal) {
      document.getElementById("promptExper").classList.remove("hidden");
    }
  });  
}

// add in all the education from firebase
function loadEducation() {
  let count = 0;
  db.collection("profile").doc(uid).collection("education").where("filled", "==", true).get().then(querySnapshot => {
    querySnapshot.forEach(education => {
      count++;
      let form = makeEduForm();
      form.querySelector(".school").innerText = education.data().school;
      form.querySelector(".date").innerText = education.data().date;
      form.querySelector(".degree").innerText = education.data().degree;
      form.id = education.id;
    });
    if(count == 0  && personal) {
      document.getElementById("promptEdu").classList.remove("hidden");
    }
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

// function to load the tags from firebase that the use has picked
function loadTags(profile) {
  let tags = profile.data().tags;
  for(let i = 0; i < tags.length; i++) {
    let tag = document.getElementById(tags[i]);
    tag.checked = true;
    makeTag(tag);
  }
  if(personal && tags.length == 0) {
    document.getElementById("promptTag").classList.remove("hidden");
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
  if(personal) {
    document.getElementById("promptExper").classList.add("hidden");
  }
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
  if(personal) { 
    document.getElementById("promptEdu").classList.add("hidden");
  }
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

// make a mentee card
function makeMentorCard(id, store) {
  let card = document.getElementById("mentorTemp");
  let clone = card.cloneNode(true);
  clone.style.display = "block";
  let mentor = db.collection("user-info").doc(id);
  let name;
  mentor.get().then(function(userinfo) {
    clone.querySelector(".mentorlink").innerText = userinfo.data().name;
    clone.querySelector(".mentorlink").setAttribute('href', 'profile.html?user=' + id);
  });
  let cont = document.getElementById(store);
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
    moveToDone(li);
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
  loadGoal(li.innerText, "finishedUL", "updateFinished");
  li.remove();
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

// send a request to the profile that you are currently looking at to see if they want to be your mentor
function sendMentorRequest() {
  firebase.auth().onAuthStateChanged(function(user) {
    let pendingRequests;
    let notifRef = db.collection("notifications").doc(uid);
    notifRef.get().then(function(notif) {
      pendingRequests = notif.data().mentorRequests;
    }).then(function() {
      // check if the user logged in is already a mentor of the page we are on
      if(mentors.includes(user.uid)){
        alert("You are already a mentor of this person");
      } else if(pendingRequests.includes(user.uid)) {
        alert("You already submitted a request to be this persons mentor");
      } else {
        firebase.firestore().collection('notifications').doc(uid).update({ 
          mentorRequests: firebase.firestore.FieldValue.arrayUnion(user.uid)
        });
      }
    });
  });
}

// send a request to the profile that you are currently looking at to see if they want to be your mentee
function sendMenteeRequest() {
  firebase.auth().onAuthStateChanged(function(user) {
    let pendingRequests;
    let notifRef = db.collection("notifications").doc(uid);
    notifRef.get().then(function(notif) {
      pendingRequests = notif.data().menteeRequests;
    }).then(function(){
      // check if the user logged in is already a mentee of the page we are on
      if(mentees.includes(user.uid)){
        alert("You are already a mentee of this person");
      } else if(pendingRequests.includes(user.uid)) {
        alert("You already submitted a request to be this persons mentee");
      } else {
        firebase.firestore().collection('notifications').doc(uid).update({ 
          menteeRequests: firebase.firestore.FieldValue.arrayUnion(user.uid)
        });
      }
    })
  });
}