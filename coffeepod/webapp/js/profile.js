var name, email, photoUrl, uid, emailVerified, user;
var expForm = document.getElementById

// this function loads in the profile based on the person who is logged in
function getProfile() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      name = user.displayName;
      email = user.email;
      uid = user.uid;
      var profileRef = db.collection("profile").doc(uid);
      profileRef.get().then(function(profile) {
        if (profile.exists) {
          loadExperience()
          updatePage(profile);
          // document.getElementById("aboutText").value = profile.data().about;
          console.log("Document data:", profile.data());
        } else {
          // doc.data() will be undefined in this case
          console.log("No such profile!");
        }
      }).catch(function(error) {
        console.log("Error getting profile:", error);
      });
      console.log(email);
    } else {
      console.log("not logged in");
    }
  });
  resizeAllTextarea();
}

// this puts the about section into edit mode
function updateAbout() {
  document.getElementById("updateAbt").classList.add("hidden");
  document.getElementById("saveAbt").classList.remove("hidden");
  document.getElementById("aboutText").disabled = false;
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
  var elements = document.getElementsByClassName("experienceFrom");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
}


// save the edits made to the experience section
function saveExperience() {
  document.getElementById("saveExp").classList.add("hidden");
  document.getElementById("addExp").classList.add("hidden");
  document.getElementById("updateExp").classList.remove("hidden");
  var elements = document.getElementsByClassName("experienceFrom");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
  saveEachExperience();
}

// put the education section into the edit mode
function updateEducation() {
  document.getElementById("updateEdu").classList.add("hidden");
  document.getElementById("saveEdu").classList.remove("hidden");
  var elements = document.getElementsByClassName("educationForm");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
}

// save the edits made to the education mode
function saveEducation() {
  document.getElementById("saveEdu").classList.add("hidden");
  document.getElementById("updateEdu").aclassList.remove("hidden");
  var elements = document.getElementsByClassName("educationForm");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
}

// put the header into edit mode
function updateHead() {
  document.getElementById("updateHd").classList.add("hidden");
  document.getElementById("saveHd").classList.remove("hidden");
  var elements = document.getElementsByClassName("headForm");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
}

// save the edits made to the header
function saveHead() {
  document.getElementById("saveHd").classList.add("hidden");
  document.getElementById("updateHd").classList.remove("hidden");
  var elements = document.getElementsByClassName("headForm");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
  firebase.firestore().collection('profile').doc(uid).update({ 
    title: document.getElementById("title").value,
    location: document.getElementById("location").value
  });
}

// update the profile page with information from firebase
function updatePage(profile) {
  var abtText = document.getElementById("aboutText");
  abtText.value = profile.data().about;
  document.getElementById("name").innerText = profile.data().name;
  document.getElementById("title").innerText = profile.data().title;
  document.getElementById("location").innerText = profile.data().location;
}

// add in all the experience from firebase
function loadExperience() {
  db.collection("profile").doc(uid).collection("experience").where("filled", "==", true).get().then(querySnapshot => {
    querySnapshot.forEach(experience => {
      var form = makeExpForm();
      form.querySelector(".company").innerText = experience.data().company;
      form.querySelector(".date").innerText = experience.data().date;
      form.querySelector(".title").innerText = experience.data().title;
      form.querySelector(".about").innerText = experience.data().about;
      form.id = experience.id;
    });
  });  
}

// save all the experience to firebase
function saveEachExperience() {
  var cont = document.getElementById("expCont");
  var forms = cont.children;
  for(var form of forms) {
    console.log(form.id);
    firebase.firestore().collection('profile').doc(uid).collection("experience").doc(form.id).update({ 
      about: form.querySelector(".about").value,
      title: form.querySelector(".title").value,
      date: form.querySelector(".date").value,
      company: form.querySelector(".company").value
    });
  }
}

// function to resize an object based on the content inside of it
function resize(resizeObj) {
  resizeObj.style.height = (resizeObj.scrollHeight+10)+'px';
}

// add a form to the experience section so the user can add a new setion
function addExpForm() {
  var clone = makeExpForm();
  // resize the textareas
  resizeAllTextarea();
  db.collection('profile').doc(uid).collection('experience').add ({
    filled: true,
    company: "Company here",
    date: "Date here",
    title: "Title here",
    about: "Add your experience!"
  })
  .then(function(docRef) {
    clone.id = docRef.id;
    console.log(clone.id);
  });  
}

// makes a new form for the experience section
function makeExpForm() {
  var form = document.getElementById("expFrom");
  var clone = form.cloneNode(true);
  clone.style.display = "block";
  var cont = document.getElementById("expCont");
  cont.appendChild(clone);
  return clone;
}

// makes all textareas fit the content they hold
function resizeAllTextarea() {
  $("textarea").each(function () {
    this.style.height = (this.scrollHeight+10)+'px';
  });
}