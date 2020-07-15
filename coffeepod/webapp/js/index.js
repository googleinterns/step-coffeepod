var name, photoUrl, uid, emailVerified, user;

function getProfile() {
  auth.onAuthStateChanged(function(user) {
    if (user) {
      uid = user.uid;
      var profileRef = db.collection("profile").doc(uid);
      profileRef.get().then(function(profile) {
        if (profile.exists) {
          updatePage(profile);
          console.log("Document data:", profile.data());
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
}

function updatePage(profile) {
    
    let names = document.querySelectorAll(".name");
    names.forEach(item => item.innerText+= profile.data().name);

    let titles = document.querySelectorAll(".title");
    titles.forEach(item => item.innerText = profile.data().title);

    document.getElementById("currDate").innerText = getCurrentDate();

}

function getCurrentDate(){
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date =  new Date();
    let year = date.getFullYear();
    let month = months[date.getMonth()];
    let day = date.getDate();
    return (month + " " + day + ", " + year);
}

