// When pending is false and accepted is false, then the meeting has been declined by the other user
// When accepted = false and pending = true, then we are waiting for the other person's response
// When accepted = true and pending = false, the meeting has been accepted and should be added to the schedule


class Meeting {
     constructor(id, title, when, where, description, pending, accepted) {
        this.id = id;
        this.title = title;
        this.when = when;
        this.where = where;
        this.description = description;
        this.pending = pending; // default value is true
        this.accepted = accepted; // default value is false
    }
}


function sendMeetingRequest(event){
    event.preventDefault();
    // get information from the form
    const meetingForm = document.getElementById("meeting-form");
    const title = meetingForm['title'].value;
    const when = new Date(meetingForm['when'].value).getTime();
    const where = meetingForm['where'].value;
    const description = meetingForm['description'].value;

    const meeting = new Meeting("", title, when, where, description, true, false);
    recordMeetingInfoAndSendNotification(meeting);

    // add confirmation on the screen
    // confirm on the page for current user
    
    let personToNotifyRole, personToNotifyName;
    if (currentUserIsMentor == "true") {
        personToNotifyRole = "mentee";
        personToNotifyName = menteeName;
    } else {
        personToNotifyRole = "mentor";
        personToNotifyName = mentorName;
    }


    const addConfirm = document.getElementById("add-confirm-meeting");
    const addConfirmName = "<span class='orangeTextLight'>" + personToNotifyName + "</span>";
    addConfirm.innerHTML = "Your meeting request is sent to your " + personToNotifyRole + " " + addConfirmName + "!" + " Request another meeting:";
    meetingForm.reset();  
}

function recordMeetingInfoAndSendNotification(meeting) {
    // put meeting info into meetings and auto generate an id for it

    db.collection('mentorship').doc(mentorshipID).collection('meetings').add({
        title: meeting.title,
        when: meeting.when,
        where: meeting.where,
        description: meeting.description,
        accepted: false,
        pending: true,
        setByMentor: (currentUserIsMentor == "true") // set by mentor can either be intially set by or updated by mentor
    }).then(function(newMeetingRef) {
        meeting.id = newMeetingRef.id;;
        sendNotification(meeting);

        // Reflect the change in the dom (add the meeting to pending section without refreshing)
        addMeetingToList("pending-meeting-list", meeting.id, new Date(meeting.when));
        document.getElementById("num-pending").innerText = parseInt(document.getElementById("num-pending").innerText) + 1;
    })
}

function sendNotification(meeting) {
    db.collection('mentorship').doc(mentorshipID).get().then(function(mentorship) {
        let personToNotifyId;
        if (currentUserIsMentor == "true") {
            personToNotifyId = mentorship.data().menteeId;
        } else {
            personToNotifyId = mentorship.data().mentorId;
        }

        addNotification(personToNotifyId, meeting);
    });
    
}

// in notification, store meeting id and mentorship id

function addNotification(personId, meeting) {
    db.collection('notifications').doc(personId).update({
        meetingNotifs: firebase.firestore.FieldValue.arrayUnion({mentorshipId: mentorshipID, meetingId: meeting.id, action: "created", timestamp: Date.now()})
    });
}


function getAcceptedMeetings() {
    const meetingsRef = db.collection('mentorship').doc(mentorshipID).collection('meetings');
    let meetingCount = 0;
    meetingsRef.where('when', '>', Date.now()).where('accepted', '==', true).orderBy("when", "asc").get().then(function (meetings) {
        meetings.forEach(meeting => {
            meetingCount += 1;
            addMeetingToList("upcoming-meeting-list", meeting.id, meeting.data().when, false);
        });
            document.getElementById("num-upcoming").innerText = meetingCount;
            document.getElementById("upcoming-meeting-list").classList.remove('hidden');
    });
}

function getPendingMeetings() {
    const meetingsRef = db.collection('mentorship').doc(mentorshipID).collection('meetings');
    let meetingCount = 0;
    meetingsRef.where('when', '>', Date.now()).where('pending', '==', true).orderBy("when", "asc").get().then(function (meetings) {
        meetings.forEach(meeting => {
            meetingCount += 1;
            addMeetingToList("pending-meeting-list", meeting.id, meeting.data().when, false);
        });
            document.getElementById("num-pending").innerText = meetingCount;
            document.getElementById("pending-meeting-list").classList.remove('hidden');
    });
}

function getPastMeetings() {
    const meetingsRef = db.collection('mentorship').doc(mentorshipID).collection('meetings');
    let meetingCount = 0;
    meetingsRef.where('when', '<=', Date.now()).where('pending', '==', false).where('accepted', '==', true).orderBy("when", "asc").get().then(function (meetings) {
        meetings.forEach(meeting => {
            meetingCount += 1;
            addMeetingToList("past-meeting-list", meeting.id, meeting.data().when, true);
        });
        document.getElementById("num-past").innerText = meetingCount;
        document.getElementById("past-meeting-list").classList.remove('hidden');
    });
}


function addMeetingToList(listId, meetingId, meetingWhen, isPastMeeting){
    const meetingList = document.getElementById(listId);

    const meetingLiEle = document.getElementById("meeting-ele")
    const meetingLiEleCloned = meetingLiEle.cloneNode(true);

    meetingLiEleCloned.setAttribute('id', meetingId);
    meetingLiEleCloned.classList.remove('hidden');

    const meetingDate = meetingLiEleCloned.querySelector("#meeting-date");
    meetingDate.innerText = new Date(meetingWhen);
    meetingDate.setAttribute('onclick', 'showMeetingDetails(' + "'" + meetingId + "'" + "," + "'" + isPastMeeting + "'" + ')');

    meetingList.appendChild(meetingLiEleCloned);
}

function showMeetingDetails(meetingId, isPastMeeting) {
    const mentorshipDoc =  db.collection('mentorship').doc(mentorshipID);
    const meetingsRef = mentorshipDoc.collection('meetings');
    const whenExpand = document.getElementById("expand-when");
    const whereExpand = document.getElementById("expand-where");
    const setByExpand = document.getElementById("expand-set-by");
    const descriptionExpand = document.getElementById("expand-description");
    const titleExpand = document.getElementById("expand-title");

    meetingsRef.doc(meetingId).get().then(function(meeting) {
        whenExpand.innerText = new Date(meeting.data().when);
        whereExpand.innerText = meeting.data().where;
        descriptionExpand.innerText = meeting.data().description;
        titleExpand.innerText = meeting.data().title;

        // Get from mentor - mentee name currently in the html page
        if (meeting.data().setByMentor == true) {
            setByExpand.innerText = document.getElementById("mentor-name").innerText;
        } else {
            setByExpand.innerText = document.getElementById("mentee-name").innerText;
        }
    });

    // Delete confirmation from previous meeting choice
    if (document.getElementById('notify-delete-confirmation').style.display != 'none') {
        document.getElementById('notify-delete-confirmation').classList.add('hidden');
    }

    // Show the meetings if not yet shown
    document.getElementById("meeting-details-under").classList.remove('hidden');


    // Set attribute for delete meeting button so that the meeting can be deleted
    // Only show delete buttons for upcoming and pending meetings

    const deleteMeetingBtn = document.getElementById("delete-meeting-button");
    deleteMeetingBtn.setAttribute('onclick', 'deleteMeeting(' + "'" + meetingId + "'" + ")");

    if (isPastMeeting != "true") {
        deleteMeetingBtn.classList.remove('hidden');
    } else {
        deleteMeetingBtn.classList.add('hidden');
    }
    
    const detailSection = document.getElementById("meeting-details-expand");

    // Show the details section
    if (detailSection.style.display == 'none') {
        detailSection.style.display = 'block';

        // Reduce the space for schedule
        document.querySelectorAll('.tab-pane').forEach(tabPane =>
            tabPane.style.height = '200px');
        document.getElementById('meetings-box').style.height = '310px';
    };

}


function hideDetails(){
    const detailSection = document.getElementById("meeting-details-expand");
    detailSection.style.display = "none";
    // Increase the space for tab-pan
    document.querySelectorAll('.tab-pane').forEach(tabPane =>
            tabPane.style.height = '380px');
    document.getElementById('meetings-box').style.height = '500px';
}

function deleteMeeting(meetingId) {
    // Send notification to meeting response either way 
    // If the meeting is pending, remove the meeting from the other person's meeting request and delete from firestore
    // If the meeting is accepted (if it's not then it should be deleted), then send to the person's meeting response

    document.getElementById("notify-delete-confirmation").classList.remove('hidden');
    document.getElementById("meeting-details-under").classList.add('hidden');
    // Delete the meeting element from DOM
    document.getElementById(meetingId).classList.add('hidden');

    const meetingRef = db.collection('mentorship').doc(mentorshipID).collection('meetings').doc(meetingId);
    meetingRef.get().then(function(meeting) {
        //deleteMeetingFromFirestore(meetingId);
        db.collection('mentorship').doc(mentorshipID).get().then(function(mentorship) {
            let otherPersonId, currentUserId;
            if (currentUserIsMentor == "true") {
                otherPersonId = mentorship.data().menteeId;
                currentUserId = mentorship.data().mentorId;

            } else {
                otherPersonId = mentorship.data().mentorId;
                currentUserId = mentorship.data().menteeId;
            }
        
        console.log("meeting is pending: " + meeting.data().pending);
        
        if (meeting.data().pending == true) {
            console.log("in the conditional loop for pending meeting");
            if (currentUserIsMentor == meeting.data().setByMentor.toString()) { 
                console.log("request to set and delete are from one person")
                // The current user who wants to delete the meeting is also the one who created the meeting
                // Delete the meeting from firestore and remove the meeting request for the other user
                // deleteMeetingFromFirestore(meetingId);
                removeMeetingRequestForOneUser(mentorshipId, meetingId, otherPersonId);

            } /*else { 
                // The other user wants to delete the meeting
                // Remove the meeting request and remove the meeting for the user
                
                setAcceptedToFalseInFirestore(mentorshipID, meetingId);
                removeMeetingRequestForOneUser(mentorshipId, meetingId, currentUserId);
                addMeetingResponseToSender(mentorshipId, meetingId, personToNotifyId);
            }*/
        } else { // If the meeting has already been accepted
            // Either way, send a meeting response notification
            //sendDeleteMeetingNotifInResponse(meetingId, otherPersonId, currentUserId, "deleted");
        }
      })

    })

}

function sendDeleteMeetingNotif(meetingId, otherPersonId, action) {
    db.collection('notifications').doc(otherPersonId).update({
        meetingNotifs: firebase.firestore.FieldValue.arrayUnion({mentorshipId: mentorshipID, meetingId: meeting.id, action: action})
    });
}

function removeMeetingRequestForOneUser(mentorshipId, meetingId, userId) {
    db.collection('notifications').doc(userId).update({
        meetingRequests: firebase.firestore.FieldValue.arrayRemove({mentorshipId: mentorshipId, meetingId: meetingId})
    })
}

// Deletion happens when the other person is notified of the change 
function deleteMeetingFromFirestore(meetingId) {
    db.collection('mentorship').doc(mentorshipID).collection('meetings').doc(meetingId).delete();
}

 
 /*testFieldExists();
 // add to a field that has not been instantiated
function testFirebase() {
    console.log(mentorshipID);
    db.collection('mentorship').doc(mentorshipID).collection('meetings').doc('iWe6BVc6KtP4yj0yw1Om').update({
        request: firebase.firestore.FieldValue.arrayUnion({mentorshipId: mentorshipID, meetingId: 'a4KWy8d3pjbJMMsP5NBt'})
    })
}
function testDeleteFirebase(){
    db.collection('mentorship').doc(mentorshipID).collection('meetings').doc('iWe6BVc6KtP4yj0yw1Om').update({
        request: firebase.firestore.FieldValue.arrayRemove({mentorshipId: mentorshipID, meetingId: 'a4KWy8d3pjbJMMsP5NBt'})
    })
}
function testFieldExists() {
    console.log("testing field");
    db.collection('mentorship').doc(mentorshipID).collection('meetings').doc('a4KWy8d3pjbJMMsP5NBt').get().then(function(meetingDoc) {
        if (meetingDoc.get('accepted') == null) {
            console.log("accepted does not exist");
        }
    })
}*/