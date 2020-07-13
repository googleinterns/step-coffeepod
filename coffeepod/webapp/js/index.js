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

    document.getElementById("date").innerText = getCurrentDate();

}

function getCurrentDate(){
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let date =  new Date();
    let year = date.getFullYear();
    let month = months[date.getMonth()];
    let day = date.getDate();
    return month + " " + day + ", " + year;
}

function saveQuestion(e){
    const newpost = document.getElementById("new-post");
    const topic = document.querySelector("#topic");
    const question = document.querySelector("#new-post-q");
    let form = document.querySelector("#postForm");
    e.preventDefault();
    auth.onAuthStateChanged(function(user) {
        if (user) {
            uid = user.uid;
            let date = getCurrentDate();
            let timestamp = Date.now();
            let replies = [];
            db.collection('forum').add({
                userID: uid,
                topic: topic.value,
                date: date,
                title: question.value,
                content: newpost.value,
                timestamp: timestamp,
                replies: replies
            }).then(() => {
                blurPost();  
                form.reset();
            })
        }
        else {
            console.log("user not logged in");
        }
    })
}

function newPost(){
    var post = document.getElementById("post");
    var newpost = document.getElementById("new-post");
    var button = document.getElementById("postButton");
    var navbar = document.querySelector(".navbar");
    var footer = document.querySelector(".footer");
    var topic = document.querySelector("#topic");
    var question = document.querySelector("#new-post-q");

    post.classList.remove("shadow-sm");
    post.classList.add("dim-back");
    newpost.style.display = "block";
    newpost.rows = "10";
    button.style.display = "block";
    navbar.classList.add("dimmed");
    footer.classList.add("dimmed");
    topic.style.display = "block";
    question.placeholder = "Enter your question here.";
    question.rows = "1";

    var postContainer = document.querySelectorAll(".newPostContainer");
    postContainer.forEach(item => item.style.opacity = "1");

}

function blurPost(){
    var post = document.getElementById("post");
    var newpost = document.getElementById("new-post");
    var button = document.getElementById("postButton");
    var navbar = document.querySelector(".navbar");
    var footer = document.querySelector(".footer");
    var topic = document.querySelector("#topic");
    var question = document.querySelector("#new-post-q");
    post.classList.add("shadow-sm");
    post.classList.remove("dim-back");

    newpost.style.display = "none";

    button.style.display = "none";

    navbar.classList.remove("dimmed");
    footer.classList.remove("dimmed");

    topic.style.display = "none";
    question.placeholder = "Any questions on your mind today?"

    var postContainer = document.querySelectorAll(".newPostContainer");
    postContainer.forEach(item => item.style.opacity = "0.5");
}

window.addEventListener('click', function(e){   
  if (document.getElementById('post').contains(e.target)){
      newPost();
  } else {
      // Clicked outside form div
    blurPost();
  }
});