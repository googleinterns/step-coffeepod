let name, uid, user, username, mentors, mentees, mentorRequests, menteeRequests;

// mentorRequests are people who want this user person to be their mentor
// menteeRequests are people who want this user to be their mentee

// function to load the notifications into the page
function getNotif() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      name = user.displayName;
      uid = user.uid;
      let userRef = db.collection("user-info").doc(uid);
      userRef.get().then(function(userinfo) {
        username = userinfo.data().username;
        mentors = userinfo.data().mentors;
        mentees = userinfo.data().mentees;
      }).catch(function(error) {
        console.log("Error getting person:", error);
      });
      let notifRef = db.collection("notifications").doc(uid);
      notifRef.get().then(function(notif) {
        mentorRequests = notif.data().mentorRequests;
        menteeRequests = notif.data().menteeRequests;

        if(notif.data().meetingRequests != null) {
            loadMeetingRequests();
        }

      }).then(function(){
          loadMentor();
          loadMentee();
      })
      loadPostNotif();
      loadFollowNotif();
    } else {
      // not logged in do something
    }
  });
}

function loeadMeetingRequests() {
    const notifRef = db.collection('notifications').doc(uid);
    notifRef.get().then(function(notifDoc) {
        if (notifDoc.data().meetingRequests != null) {
            // this means meetingRequests exist
            // put meetingRequests up on the site
        }
    })
}

// load the requests of people that want this user too be their mentor
function loadMentor() {
  for(let i = 0; i < mentorRequests.length; i++) {
    makeRequest(mentorRequests[i], "mentorRequest");
  }
}

// load the requests of people that want this user to be their mentee
function loadMentee() {
  for(let i = 0; i < menteeRequests.length; i++) {
    makeRequest(menteeRequests[i], "menteeRequest");
  }
}

// function that makes the request card
function makeRequest(requestId, type) {
  let requestName, requestTitle;
  let profileRef = db.collection("profile").doc(requestId);
  profileRef.get().then(function(profile) {
    requestName = profile.data().name;
    requestTitle = profile.data().title;
  }).then(function() {
    let request = document.getElementById(type);
    let clone = request.cloneNode(true);
    clone.classList.remove("hidden");
    let cont = document.getElementById("mentorStore");
    cont.appendChild(clone);
    clone.querySelector(".mentorName").innerText = requestName;
    clone.querySelector(".mentorTitle").innerText = requestTitle;
    clone.id = requestId;
    clone.querySelector(".mentorName").setAttribute('href', 'profile.html?user=' + requestId);
  });
}

// add a new mentorship when a mentorship is formed
function addNewMentorshipCollection(mentorId, menteeId) {
    db.collection('mentorship').add({
        mentorId: mentorId,
        menteeId: menteeId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function(mentorshipRef) {
        const mentorshipId = mentorshipRef.id;

        // add mentorship id to menteeOfPairs for mentee
        firebase.firestore().collection('user-info').doc(menteeId).update({ 
            menteeOfPairs: firebase.firestore.FieldValue.arrayUnion(mentorshipId)
        });

        // add mentorship id to mentorOfPairs for request.id
        firebase.firestore().collection('user-info').doc(mentorId).update({ 
            mentorOfPairs: firebase.firestore.FieldValue.arrayUnion(mentorshipId)
        });

        // add a preset goal (firestore doesn't allow empty subcollections)
        db.collection('mentorship').doc(mentorshipId).collection('goals').add({
            unchecked: ["First meeting!", "Say hi!"],
            checked: [],
            title: "Introduction: Meet my new mentor/mentee",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        db.collection('mentorship').doc(mentorshipId).collection('meetings').add({
            filled: false
        });
    }).catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

// function to approve someones mentee or mentor request
function approve(button, type) {
    console.log("Im approving");
  let request = button.closest(type);

  // add new document to chats and update chat fields for both users
  db.collection('chats').add({
      user1: uid,
      user2: request.id,
      messages: [],
      latestMessage: ""
  }).then(docRef => {
      db.collection('user-info').doc(uid).update({
          chats: firebase.firestore.FieldValue.arrayUnion(docRef.id)
      })
      db.collection('user-info').doc(request.id).update({
          chats: firebase.firestore.FieldValue.arrayUnion(docRef.id)
      })
  })
  
  if(type == ".mentor") {
    addNewMentorshipCollection(request.id, uid);
    // current user is going to be the mentee, request.id is going to be the mentor
    firebase.firestore().collection('user-info').doc(uid).update({ 
      mentors: firebase.firestore.FieldValue.arrayUnion(request.id)
    });

    // add the current user also to the requested's list of mentees
    firebase.firestore().collection('user-info').doc(request.id).update({ 
      mentees: firebase.firestore.FieldValue.arrayUnion(uid)
    });


    // remove the request
    firebase.firestore().collection('notifications').doc(uid).update({ 
      mentorRequests: firebase.firestore.FieldValue.arrayRemove(request.id)
    });
  } else {
    addNewMentorshipCollection(uid, request.id);
    // the request is the mentee, user if the mentor
    firebase.firestore().collection('user-info').doc(uid).update({ 
      mentees: firebase.firestore.FieldValue.arrayUnion(request.id)
    });
    // add the current user to the requested's list of mentors
    firebase.firestore().collection('user-info').doc(request.id).update({ 
      mentors: firebase.firestore.FieldValue.arrayUnion(uid)
    });


    // remove the request
    firebase.firestore().collection('notifications').doc(uid).update({ 
      menteeRequests: firebase.firestore.FieldValue.arrayRemove(request.id)
    });
  }
  request.remove();
}

// function to approve someones mentee or mentor request
function deny(button, type) {
  let request = button.closest(type);
  if(type == ".mentor") {
    // remove the request
    firebase.firestore().collection('notifications').doc(uid).update({ 
      mentorRequests: firebase.firestore.FieldValue.arrayRemove(request.id)
    });
  } else {
    // remove the request
    firebase.firestore().collection('notifications').doc(uid).update({ 
      menteeRequests: firebase.firestore.FieldValue.arrayRemove(request.id)
    });
  }
  request.remove();
}

// load the follow notifications to the page
function loadFollowNotif() {
  db.collection("notifications").doc(uid).collection("postNotifications").where("followed", "==", true).get().then(querySnapshot => {
    querySnapshot.forEach(commentNotif => {
      makePostNotif('followNotif', commentNotif.data().title, commentNotif);
    });
  });
}

// load the post notifications to the page
function loadPostNotif() {
  db.collection("notifications").doc(uid).collection("postNotifications").where("comment", "==", true).get().then(querySnapshot => {
    querySnapshot.forEach(commentNotif => {
      makePostNotif('postNotif', commentNotif.data().title, commentNotif);
    });
  });
}

// function the clones the template for a notificaion
function makePostNotif(temp, title, notif) {
  let template = document.getElementById(temp);
  let clone = template.cloneNode(true);
  let cont = document.getElementById("postStore");
  cont.appendChild(clone);
  clone.querySelector(".questionTitle").innerText = title;
  clone.classList.remove("hidden");
  clone.id = notif.id;
  clone.querySelector(".questionLink").setAttribute('href', '/index-ind.html?id=' + notif.data().postID);
}

// function to get rid of a post notification
function removeNotif(button, type) {
  let notification = button.closest(type);
  let id = notification.id;
  db.collection("notifications").doc(uid).collection("postNotifications").doc(id).delete();
  notification.remove();
}