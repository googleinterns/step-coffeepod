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
    
    var names = document.querySelectorAll(".name");
    names.forEach(item => item.innerText+= profile.data().name);

    var titles = document.querySelectorAll(".title");
    titles.forEach(item => item.innerText = profile.data().title);

    getCurrentDate();

}

function getCurrentDate(){
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var date =  new Date();
    var year = date.getFullYear();
    var month = months[date.getMonth()];
    var day = date.getDate();
    document.getElementById("date").innerText = month + " " + day + ", " + year;
}

function newPost(){
    console.log("post");
    const post = document.getElementById("post");
    var newpost = document.getElementById("new-post");
    var button = document.getElementById("postButton");
//    var dimmed = document.querySelectorAll(".dimmed");

    post.classList.remove("shadow-sm");
    post.classList.add("dim-back");
    newpost.rows = "10";
    button.style.display = "block";

    var postContainer = document.querySelectorAll(".newPostContainer");
    postContainer.forEach(item => item.style.opacity = "1");

}

function blurPost(){
    const post = document.getElementById("post");
    const newpost = document.getElementById("new-post");
    var button = document.getElementById("postButton");
 //   var dimmed = document.querySelectorAll(".dimmed");

    post.classList.add("shadow-sm");
    post.classList.remove("dim-back");

    newpost.rows = "2";
    newpost.style.height = newpost.scrollHeight;

    button.style.display = "none";

    var postContainer = document.querySelectorAll(".newPostContainer");
    postContainer.forEach(item => item.style.opacity = "0.5");
    
}