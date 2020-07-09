var name, email, photoUrl, uid, emailVerified, user;

function getProfile() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      name = user.displayName;
      email = user.email;
      uid = user.uid;
      var profileRef = db.collection("profile").doc(uid);
      profileRef.get().then(function(profile) {
        if (profile.exists) {
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
  console.log(document.getElementById("aboutText").value);
  firebase.firestore().collection('profile').doc(uid).update({ 
    about: document.getElementById("aboutText").value
  });
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
  document.getElementById("updateEdu").aclassList.remove("hidden");
  var elements = document.getElementsByClassName("educationForm");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = true;
  }
}

function updateHead() {
  document.getElementById("updateHd").classList.add("hidden");
  document.getElementById("saveHd").classList.remove("hidden");
  var elements = document.getElementsByClassName("headForm");
  for (var i = 0, len = elements.length; i < len; i++) {
    elements[i].disabled = false;
  }
}

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

$(function () {
    $("textarea").each(function () {
        this.style.height = (this.scrollHeight+10)+'px';
    });
});

function updatePage(profile) {
  var abtText = document.getElementById("aboutText");
  abtText.value = profile.data().about;
  resize(abtText);
  document.getElementById("name").innerText = profile.data().name;
  document.getElementById("title").innerText = profile.data().title;
  document.getElementById("location").innerText = profile.data().location;
}

function resize(resizeObj) {
  resizeObj.style.height = (resizeObj.scrollHeight+10)+'px';
}