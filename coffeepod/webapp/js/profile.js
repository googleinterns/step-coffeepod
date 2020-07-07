var name, email, photoUrl, uid, emailVerified;
var user = firebase.auth().currentUser;

function getProfile() {
  // if (user) {
  //   // User is signed in.
  //   name = user.displayName;
  //   email = user.email;
  //   photoUrl = user.photoURL;
  //   emailVerified = user.emailVerified;
  //   uid = user.uid;
  // } else {
  //   // No user is signed in.
  // }
}

function updateAbout() {
  document.getElementById("updateAbt").classList.add("hidden");
  document.getElementById("saveAbt").classList.remove("hidden");
  document.getElementById("aboutText").disabled = false;
}

function saveAbout() {
  document.getElementById("saveAbt").classList.add("hidden");
  document.getElementById("updateAbt").classList.remove("hidden");
  document.getElementById("aboutText").disabled = true;
}

function updateExperience() {
  document.getElementById("updateExp").classList.add("hidden");
  document.getElementById("saveExp").classList.remove("hidden");
  var elements = document.getElementsByClassName("experienceFrom");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
}

function saveExperience() {
  document.getElementById("saveExp").classList.add("hidden");
  document.getElementById("updateExp").classList.remove("hidden");
  var elements = document.getElementsByClassName("experienceFrom");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
}

function updateEducation() {
  document.getElementById("updateEdu").classList.add("hidden");
  document.getElementById("saveEdu").classList.remove("hidden");
  var elements = document.getElementsByClassName("educationForm");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
}

function saveEducation() {
  document.getElementById("saveEdu").classList.add("hidden");
  document.getElementById("updateEdu").classList.remove("hidden");
  var elements = document.getElementsByClassName("educationForm");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
}

$(function () {
    $("textarea").each(function () {
        this.style.height = (this.scrollHeight+10)+'px';
    });
});
