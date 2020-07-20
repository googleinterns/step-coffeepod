// This file is to pull mentors/ mentees information onto current user's hub page

var name, photoUrl, uid, emailVerified, user;

let mentorPairs, menteePairs, userId;

function getProfile() {
  auth.onAuthStateChanged(function(user) {
    if (user) { // if user is logged in 
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
