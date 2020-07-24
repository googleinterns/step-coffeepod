

function sendMeetingRequest(event){
    event.preventDefault();
    // get information from the form
    const meetingForm = document.getElementById("meeting-form");
    const title = meetingForm['title'].value;
    const when = new Date(meetingForm['when'].value);
    const where = meetingForm['where'].value;
    const description = meetingForm['description'].value;

    // add the form
    const addConfirm = document.getElementById("add-confirm-meeting");
    addConfirm.innerText = "Your meeting request is sent! Add another meeting:";
}
 
 testFirebase();
 testDeleteFirebase();
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