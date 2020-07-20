// function that makes it so you can follow a question
function follow(button, id) {
  button.innerText = "Unfollow";
  button.setAttribute("onClick", "unfollow(this, this.id)");
  firebase.firestore().collection('profile').doc(uid).update({ 
    following: firebase.firestore.FieldValue.arrayUnion(id)
  });
  db.collection('forum').doc(id).update({
    followers: firebase.firestore.FieldValue.arrayUnion(uid)
  })
}

// function that makes it so you can unfollow a question
function unfollow(button, id) {
  button.innerText = "Follow";
  button.setAttribute("onClick", "follow(this, this.id)");
  firebase.firestore().collection('profile').doc(uid).update({ 
    following: firebase.firestore.FieldValue.arrayRemove(id)
  });
  db.collection('forum').doc(id).update({
    followers: firebase.firestore.FieldValue.arrayRemove(uid)
  })
}


// check if the user is already following the questions
function checkFollowing() {
  let uid;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      uid = user.uid;
    }
      let profileRef = db.collection("profile").doc(uid);
    profileRef.get().then(function(profile) {
      following = profile.data().following;
    }).then(function() {
      let buttons = document.getElementsByClassName("follow");
      let button;
      for(let i = 0; i < buttons.length; i++) {
        button = buttons[i];
        if(following.includes(button.id)) {
          button.innerText = "Unfollow";
          button.setAttribute("onClick", "unfollow(this, this.id)");
        }
      }  
    })
  })
}


function checkFollowOne(button) {
  let uid;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      uid = user.uid;
    }
    let profileRef = db.collection("profile").doc(uid);
    profileRef.get().then(function(profile) {
      following = profile.data().following;
    }).then(function() {
      if(following.includes(button.id)) {
        button.innerText = "Unfollow";
        button.setAttribute("onClick", "unfollow(this, this.id)");
      }
    })
  })
}