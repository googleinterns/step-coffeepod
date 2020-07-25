let name, uid, user, username, mentors, mentees, mentorRequests, menteeRequests;
//uid stores the current user's id

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


function loadMeetingRequests() {
    const notifRef = db.collection('notifications').doc(uid);
    notifRef.get().then(function(notifDoc) {
        // this means meetingRequests exist
        // put meetingRequests up on the site
        putAllMeetingRequestsOnPage(notifDoc.data().meetingRequests);
    })
}

function putAllMeetingRequestsOnPage(meetingRequests) {
    if (meetingRequests != null) {
        for (let i = 0; i < meetingRequests.length; i++) {
            const meetingId = meetingRequests[i].meetingId;
            const mentorshipId = meetingRequests[i].mentorshipId;
            putOneMeetingRequestOnPage(meetingId, mentorshipId);
        }
    }
}

function putOneMeetingRequestOnPage(meetingId, mentorshipId) {
    console.log("mentorship id is:" + mentorshipId);
    console.log("meeting id is:" + meetingId);
    let senderId;

    
    const mentorshipRef = db.collection('mentorship').doc(mentorshipId);
    // (0) Clone the meeting request element and access necessary children nodes
    const meetingRequestSection = document.getElementById("meeting-request-section");
    const meetingRequestElement = document.getElementById("meeting-request-board");
    const meetingRequestElementCloned = meetingRequestElement.cloneNode(true);
    
    const titleElement = meetingRequestElementCloned.querySelector("#title");
    const whenElement = meetingRequestElementCloned.querySelector("#when");
    const whereElement = meetingRequestElementCloned.querySelector("#where");
    const descriptionElement = meetingRequestElementCloned.querySelector("#description");

    /* Show, hide buttons for meeting details
    const seeMoreElement = meetingRequestElementCloned.getElementById("see-more");
    seeMoreElement.setAttribute('onclick', 'showMeetingDetails(this)');
    const hideElement = meetingRequestElementCloned.getElementById("hide-details");
    hideElement.setAttribute('onclick', 'hideMeetingDetails(this)');*/

    // Change all elements of this name
    const senderNameElements = meetingRequestElementCloned.querySelectorAll(".request-sender-name");
    const senderRoleElement = meetingRequestElementCloned.querySelector("#request-sender-role");

    // Add action functions for the approve and remove button
    meetingRequestElementCloned.querySelector("#approve-meeting").setAttribute("onclick", "approveMeeting(this," + "'"  + mentorshipId + "'," + "'"  + meetingId + "'" + ")");
    meetingRequestElementCloned.querySelector("#remove-meeting").setAttribute("onclick", "removeMeeting(this," + "'"  + mentorshipId + "'," + "'"  + meetingId + "'" + ")");

    mentorshipRef.get().then(function(mentorship) {
        console.log(mentorship.data());
    });

    mentorshipRef.collection('meetings').doc(meetingId).get().then(function(meetingDoc) {
        console.log(meetingDoc.data());
    });

    // (2) Update details of the meeting
    mentorshipRef.collection('meetings').doc(meetingId).get().then(function(meetingDoc) {
        if (meetingDoc.exists) { // Check for actual meeting's existence before doing anything
            console.log(meetingDoc === undefined);
            console.log("meetingDoc is: " + meetingDoc.data());
            // (1) Update sender's information 
            mentorshipRef.get().then(function (mentorshipDoc) {
                console.log("Mentorshipdoc is: " + mentorshipDoc.data());
                if (meetingDoc.data().setByMentor == true) {
                    senderId = mentorshipDoc.data().mentorId;
                    senderRoleElement.innerText = "mentor";
                } else {
                    senderId = mentorshipDoc.data().menteeId;
                    senderRoleElement.innerText = "mentee";
                }
                db.collection('profile').doc(senderId).get().then(function(profileDoc) {
                    senderNameElements.forEach(name => name.innerText = profileDoc.data().name);
                });

            });

            
            titleElement.innerText = meetingDoc.data().title;
            whenElement.innerText = meetingDoc.data().when;

            console.log("when is: " + meetingDoc.data().when);
            whereElement.innerText = meetingDoc.data().where;
            descriptionElement.innerText = meetingDoc.data().description;
            // (3) Unhide all of this information
            meetingRequestElementCloned.classList.remove("hidden");
            meetingRequestSection.appendChild(meetingRequestElementCloned);
            console.log(meetingRequestElementCloned);
        } 
    });

}



/*
function showMeetingDetails(showMoreEle) {
    // Show the meeting details card
    const meetingDetailsCard = showMoreEle.closest('#meeting-details-card');
    meetingDetailsCard.style.display = 'inline-table';

    // Hide the see more link
    showMoreEle.style.display = 'none';

    // Show the hide link
    const hideEle = showMoreEle.closet('#hide-details');
    hideEle.style.display = 'inline-block';
}

function hideMeetingDetails(hideEle) {
    // Show the meeting details card
    const meetingDetailsCard = hideEle.closest('#meeting-details-card');
    meetingDetailsCard.style.display = 'none';

    // Hide the hide link
    hideEle.style.display = 'none';

    // Show the hide link
    const showMoreEle = showMoreEle.closet('#see-more');
    showMoreEle.style.display = 'inline-block';
}*/

function approveMeeting(buttonEle, mentorshipId, meetingId) {
    // Set the accepted stage of the meeting to true
    db.collection('mentorship').doc(mentorshipId).collection('meetings').doc(meetingId).update({
            accepted: true,
            pending: false
    });

    // Show the result to the current user 
    const confirmation = buttonEle.closest('approve-confirmation');
    confirmation.classList.remove('hidden');

    const actionButtons = buttonEle.closest('response-options');
    actionButtons.classList.add('hidden');
}

function removeMeeting(buttonEle, mentorshipId, meetingId) {
    // Set the accepted stage of the meeting to false
    db.collection('mentorship').doc(mentorshipId).collection('meetings').doc(meetingId).update({
            accepted: false,
            pending: false
    });

    // Show the result to the current user 
    const confirmation = buttonEle.closest('remove-confirmation');
    confirmation.classList.remove('hidden');

    const actionButtons = buttonEle.closest('response-options');
    actionButtons.classList.add('hidden');
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