// When pending is false and accepted is false, then the meeting has been declined by the other user
// When accepted = false and pending = true, then we are waiting for the other person's response
// When accepted = true and pending = false, the meeting has been accepted and should be added to the schedule


class Meeting {
     constructor(id, title, when, where, description, pending, accepted, filled) {
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
    const when = new Date(meetingForm['when'].value);
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
        setByMentor: (currentUserIsMentor == "true")
    }).then(function(newMeetingRef) {
        const meetingId = newMeetingRef.id;
        meeting.id = meetingId;
        sendNotification(meeting);
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
        meetingRequests: firebase.firestore.FieldValue.arrayUnion({mentorshipId: mentorshipID, meetingId: meeting.id})
    });
}

function showMeetingsOnPage() {
    // only show meetings that are accepted and are pending
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
