let name, uid, user, username, mentors, mentees, mentorRequests, menteeRequests;
//uid stores the current user's id

// mentorRequests are people who want this user person to be their mentor
// menteeRequests are people who want this user to be their mentee

// function to load the notifications into the page

/* // TEST FIRESTORE FOR SOME UNDEFINED FIELDS IN AN ARRAY OF MAPS
db.collection('notifications').doc('Wk7lrwtTP8aJA2rVy1JGXIHpQEt2').get().then(function(notif) {
    const meetingRequests = notif.data().meetingRequests;
    if (meetingRequests != null) {
        console.log("there are some meeting requests");
        console.log(meetingRequests);
    } 
    console.log(meetingRequests[0].updated);
    console.log(meetingRequests[0].updated == undefined);
});*/

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

        if (notif.data().meetingNotifs != null) {
          loadMeetingNotifs();
        }

      }).then(function() {
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

function getDate(date){
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let year = date.getFullYear();
    let month = months[date.getMonth()];
    let day = date.getDate();
    return (month + " " + day + ", " + year);
}

function loadMeetingNotifs() {
  const notifRef = db.collection('notifications').doc(uid);
  notifRef.get().then(function(notifDoc) {
    // this means meetingNotifs exist
    // put meetingNotifs up on the site
    putAllMeetingNotifsOnPage(notifDoc.data().meetingNotifs);
  })
}

function putAllMeetingNotifsOnPage(meetingNotifs) {
  if (meetingNotifs != null) {
    for (let i = 0; i < meetingNotifs.length; i++) {
      const meetingId = meetingNotifs[i].meetingId;
      const mentorshipId = meetingNotifs[i].mentorshipId;
      const action = meetingNotifs[i].action;
      const timestamp = meetingNotifs[i].timestamp;
      putOneMeetingNotifOnPage(meetingId, mentorshipId, action, timestamp);
    }
  }
}

function getNotificationContent(action) {
  let notifContent;

    if (action == "created") {
        notifContent = "Your <span id='sender-role'></span> <a class='sender-name'></a> wants to schedule a meeting with you.</p>";

    } else if (action == "accepted") {
        notifContent = "Your <span id='sender-role'></span> <a class='sender-name'></a> accepted your meeting request.</p>";

    } else if (action == "removed") {
        notifContent = "Your <span id='sender-role'></span> <a class='sender-name'></a> removed your meeting request.</p>";

    } else if (action == "deleted") {
        notifContent = "Your <span id='sender-role'></span> <a class='sender-name'></a> deleted a meeting with you.</p>"
    }

    return notifContent;
}

function enableActionButtons(meetingNotifEle, mentorshipId, meetingId, senderId, action, timestamp) {
    let latterPartOnClickFunc;
    if (action == "created") {
      // Add action functions for the approve button

      meetingNotifEle.querySelector("#approve-meeting").classList.remove('hidden');
      meetingNotifEle.querySelector("#remove-meeting").classList.remove('hidden');

      latterPartOnClickFunc = "'" + mentorshipId + "'," + "'" + meetingId + "'" + "," + "'" + senderId + "'" + "," + "'" + timestamp + "'" +")";
      meetingNotifEle.querySelector("#approve-meeting").setAttribute("onclick", "approveMeeting(this," + latterPartOnClickFunc);
      meetingNotifEle.querySelector("#remove-meeting").setAttribute("onclick", "removeMeeting(this," + latterPartOnClickFunc);

    } else {
      let accepted = true;
      if (action == "removed" || action == "deleted") {
          accepted = false;
          meetingNotifEle.querySelector("#confirm-action-message").innerText = "deleted";
          // The default case for action is "confirmed"
      }
      latterPartOnClickFunc = "'"  + mentorshipId + "'," + "'"  + meetingId + "'" + "," + "'"  + accepted + "'" + "," + "'"  + action + "'" + "," + "'" + timestamp + "'" +")";
      meetingNotifEle.querySelector("#i-am-aware").setAttribute("onclick", "iAmAware(this," + latterPartOnClickFunc);
      meetingNotifEle.querySelector("#i-am-aware").classList.remove('hidden');
    }
}

function updateToggleForMeetingDetails(clonedMeetingNotifEle, meetingId) {
    const toggleHead = clonedMeetingNotifEle.querySelector('#meeting-details-head');
    toggleHead.setAttribute('id', 'meeting-details-head' + meetingId);

    const toggleBody = clonedMeetingNotifEle.querySelector('#collapseDetails');
    toggleBody.setAttribute('id', 'collapseDetails' + meetingId);
    toggleBody.setAttribute('aria-labelledby',  'meeting-details-head' + meetingId);

    const toggleLink = clonedMeetingNotifEle.querySelector('#toggle-link');
    toggleLink.setAttribute('data-target', '#collapseDetails' + meetingId);
    toggleLink.setAttribute('aria-controls', 'collapseDetails' + meetingId);
}

function putOneMeetingNotifOnPage(meetingId, mentorshipId, action, timestamp) {
    let senderId, currentUserIsMentor;

    const mentorshipRef = db.collection('mentorship').doc(mentorshipId);
    const meetingNotifSection = document.getElementById("meeting-notif-section");

    const meetingNotifElement = document.getElementById("meeting-notif-board");
    const meetingNotifElementCloned = meetingNotifElement.cloneNode(true);

    // Update toggle to show detail of the meetings
    updateToggleForMeetingDetails(meetingNotifElementCloned, meetingId);

    // (2) Update details of the meeting
    const titleElement = meetingNotifElementCloned.querySelector("#title");
    const whenElement = meetingNotifElementCloned.querySelector("#when");
    const whereElement = meetingNotifElementCloned.querySelector("#where");
    const descriptionElement = meetingNotifElementCloned.querySelector("#description");

    mentorshipRef.collection('meetings').doc(meetingId).get().then(function(meetingDoc) {
      if (meetingDoc.exists && meetingDoc.data().accepted != null) {
        // Check for actual meeting's existence and that it is not a pseudo meeting before next steps

        // (1) Update sender's information 
        mentorshipRef.get().then(function(mentorshipDoc) {

          // Actions of the sender: scheduled, accepted, removed, deleted

          // Set the meeting notification content
          const notifContentPlace = meetingNotifElementCloned.querySelector("#notif-content");
          notifContentPlace.innerHTML = getNotificationContent(action);
          
          // Update the timestamp of the notification
          meetingNotifElementCloned.querySelector("#meeting-notif-timestamp").innerHTML = getDate(new Date(timestamp));

          const senderRoleElement = meetingNotifElementCloned.querySelector("#sender-role");

          if (uid == mentorshipDoc.data().mentorId) {
            currentUserIsMentor = true;
            senderId = mentorshipDoc.data().menteeId;
            senderRoleElement.innerText = "mentee";
          } else {
            currentUserIsMentor = false;
            senderId = mentorshipDoc.data().mentorId;
            senderRoleElement.innerText = "mentor";
          }

          // Add action functions for the response section
          enableActionButtons(meetingNotifElementCloned, mentorshipId, meetingId, senderId, action, timestamp);

          // Change all elements of this name
          const senderNameElements = meetingNotifElementCloned.querySelectorAll(".sender-name");
          db.collection('profile').doc(senderId).get().then(function(profileDoc) {
            senderNameElements.forEach(name => {
              name.innerText = profileDoc.data().name
              name.setAttribute('href', 'profile.html?user=' + senderId);
            });

          });

          // Create a hub-ind link for the see all of current meetings 
          const queryStringForHubInd = "?mentorshipId=" + mentorshipId + "&currentIsMentor=" + currentUserIsMentor;
          const hubIndLinks = meetingNotifElementCloned.querySelectorAll('.hub-ind');
          hubIndLinks.forEach(hubIndLink => {
            hubIndLink.setAttribute('href', 'hub-ind.html' + queryStringForHubInd);
          })

        });

        titleElement.innerText = meetingDoc.data().title;
        whenElement.innerText = new Date(meetingDoc.data().when);

        whereElement.innerText = meetingDoc.data().where;
        descriptionElement.innerText = meetingDoc.data().description;

        // (3) Unhide all of this information
        meetingNotifElementCloned.classList.remove("hidden");
        meetingNotifSection.appendChild(meetingNotifElementCloned);
      }
    });

}

// This function notifies the current user of the other user's deletion or removal of the meeting
// Delete the meeting from firestore and delete the notification 
function iAmAware(buttonEle, mentorshipId, meetingId, meetingAccepted, action, timestamp) {

    // If meeting is not accepted, then remove the meeting from meetings list
    // Else, do nothing 

    if (meetingAccepted == "false") {
        db.collection('mentorship').doc(mentorshipId).collection('meetings').doc(meetingId).delete();
    }

    // Show the result to the current user 
    const confirmation = $(buttonEle).closest(':has(#delete-confirmation)').children('#delete-confirmation').get(0);
    confirmation.classList.remove('hidden');

    const actionButtons = buttonEle.closest('#response-options');
    actionButtons.classList.add('hidden');

    removeMeetingNotif(mentorshipId, meetingId, action, timestamp);
}

function approveMeeting(buttonEle, mentorshipId, meetingId, senderId, timestamp) {

    // Set the accepted stage of the meeting to true
    db.collection('mentorship').doc(mentorshipId).collection('meetings').doc(meetingId).update({
            accepted: true,
            pending: false
    });

    // Show the result to the current user 
    const confirmation = $(buttonEle).closest(':has(#approve-confirmation)').children('#approve-confirmation').get(0);
    confirmation.classList.remove('hidden');

    const actionButtons = buttonEle.closest('#response-options');
    actionButtons.classList.add('hidden');

    removeMeetingNotif(mentorshipId, meetingId, "created", timestamp);
    addMeetingResponseToSender(mentorshipId, meetingId, senderId, "accepted");
}

// Remove meeting notification from current user's notifications after the current user is notified that the other user either removed or deleted the meeting
function removeMeetingNotif(mentorshipId, meetingId, action, timestamp) {
    db.collection('notifications').doc(uid).update({
        meetingNotifs: firebase.firestore.FieldValue.arrayRemove({mentorshipId: mentorshipId, meetingId: meetingId, action: action, timestamp: parseInt(timestamp)})
    })
}

function setAcceptedToFalseInFirestore(mentorshipId, meetingId) {
    // Set the accepted stage of the meeting to false
    db.collection('mentorship').doc(mentorshipId).collection('meetings').doc(meetingId).update({
            accepted: false,
            pending: false
    });
}

function removeMeeting(buttonEle, mentorshipId, meetingId, senderId) {
    // Set the accepted stage of the meeting to false
    setAcceptedToFalseInFirestore(mentorshipId, meetingId);

    // Show the result to the current user 
    const confirmation = $(buttonEle).closest(':has(#remove-confirmation)').children('#remove-confirmation').get(0);
    confirmation.classList.remove('hidden');

    const actionButtons = buttonEle.closest('#response-options');
    actionButtons.classList.add('hidden');

    removeMeetingNotif(mentorshipId, meetingId, "created", timestamp);
    addMeetingResponseToSender(mentorshipId, meetingId, senderId, "removed");
}


// Add meeting responses
// The message (whether accepted or removed, is stored in the meeting itself)
function addMeetingResponseToSender(mentorshipId, meetingId, senderId, action) {
    db.collection('notifications').doc(senderId).update({
        meetingNotifs: firebase.firestore.FieldValue.arrayUnion({mentorshipId: mentorshipId, meetingId: meetingId, action: action, timestamp: Date.now()})
    });
}

// ----------------------------- MENTOR-MENTEE NOTIFICATIONS ------------------------------------------------------

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

// ----------------------------- POST AND FOLLOW NOTIFICATIONS ------------------------------------------------------

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