const queryStringHubInd = window.location.search;
const urlParamsHubInd = new URLSearchParams(queryStringHubInd);
const currentUserIsMentor = urlParamsHubInd.get('currentIsMentor');
const mentorshipID = urlParamsHubInd.get('mentorshipId');

let mentorId, menteeId, mentorName, menteeName, mentorTitle, menteeTitle;

// WELCOME SECTION

function loadData() {
    getGoalCards();
    addOpeningContent();
    addOverview();
    getAllMeetings();
}

function addOpeningContent() {
    const hubTitle = document.getElementById("subpage-title");

    db.collection('mentorship').doc(mentorshipID).get().then(function (mentorshipDoc) {
        mentorId = mentorshipDoc.data().mentorId;
        menteeId = mentorshipDoc.data().menteeId;


        // Add starting time in overview section
        timeStart = mentorshipDoc.data().timestamp.toMillis();
        document.getElementById("start-time").innerText = fromMillisecondsToMonthAndYear(timeStart);

        // Get name and title of mentors and mentees
        db.collection('profile').doc(mentorId).get().then(function (profileDoc) {
            mentorName = profileDoc.data().name;
            mentorTitle = profileDoc.data().title;

            // Fill in the mentor's information
            hubTitle.querySelector("#mentor-name").innerText = mentorName;
            document.getElementById("mentor-card-name").innerText = mentorName;
            document.getElementById("mentor-card-title").innerText= mentorTitle;

            // Add meeting content 
            if (!(currentUserIsMentor == "true")) {
                document.getElementById("add-role").innerText = "mentor";
                document.getElementById("add-confirm-name").innerText = mentorName;
            }
        });

        db.collection('profile').doc(menteeId).get().then(function (profileDoc) {
            menteeName = profileDoc.data().name;
            menteeTitle = profileDoc.data().title;

            // Fill in the mentee's information
            hubTitle.querySelector("#mentee-name").innerText = menteeName;
            document.getElementById("mentee-card-name").innerText = menteeName;
            document.getElementById("mentee-card-title").innerText = menteeTitle;

            if (currentUserIsMentor == "true") {
                document.getElementById("add-role").innerText = "mentee";
                document.getElementById("add-confirm-name").innerText = menteeName;
            }
        });

    });

}


// OVERVIEW SECTION
function addOverview() {
    addNumGoalCards();
}


function fromMillisecondsToMonthAndYear(milliseconds) {
    const date = new Date(parseInt(milliseconds));
    return date.toLocaleString('default', { month: 'long'}) + " " + date.getFullYear();
}

// MEETING SECTION
// need both pending and accepted because want to notify the other person of the change in status, eg false-false means it should be removed

function getAllMeetings() {
    getAcceptedMeetings();
    getPendingMeetings();
    getPastMeetings();
}

function getAcceptedMeetings() {
    const meetingsRef = db.collection('mentorship').doc(mentorshipID).collection('meetings');
    let meetingCount = 0;
    meetingsRef.where('when', '>', Date.now()).where('accepted', '==', true).orderBy("when", "asc").get().then(function (meetings) {
        meetings.forEach(meeting => {
            meetingCount += 1;
            addMeetingToList("upcoming-meeting-list", meeting.id, meeting.data().when);
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
            addMeetingToList("pending-meeting-list", meeting.id, meeting.data().when);
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
            addMeetingToList("past-meeting-list", meeting.id, meeting.data().when);
        });
        document.getElementById("num-past").innerText = meetingCount;
        document.getElementById("past-meeting-list").classList.remove('hidden');
    });
}


function addMeetingToList(listId, meetingId, meetingWhen){
    const meetingList = document.getElementById(listId);

    const meetingLiEle = document.getElementById("meeting-ele")
    const meetingLiEleCloned = meetingLiEle.cloneNode(true);

    meetingLiEleCloned.setAttribute('id', meetingId);
    meetingLiEleCloned.classList.remove('hidden');

    const meetingDate = meetingLiEleCloned.querySelector("#meeting-date");
    meetingDate.innerText = new Date(meetingWhen);
    meetingDate.setAttribute('onclick', 'showMeetingDetails(' + "'" + meetingId + "'" + ')');

    meetingList.appendChild(meetingLiEleCloned);
}

function showMeetingDetails(meetingId) {
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

    // Set attribute for delete meeting button so that the meeting can be deleted
    const deleteMeetingBtn = document.getElementById("delete-meeting-button");
    deleteMeetingBtn.setAttribute('onclick', 'deleteMeeting(' + "'" + meetingId + "'" + ")");

    const detailSection = document.getElementById("meeting-details-expand");

    // Show the details section
    if (detailSection.style.display == 'none') {
        detailSection.style.display = 'block';

        // Reduce the space for schedule
        document.querySelectorAll('.tab-pane').forEach(tabPane =>
            tabPane.style.height = '200px');
        document.getElementById('meetings-box').style.height = '300px';
    };

}

function hideDetails(){
    const detailSection = document.getElementById("meeting-details-expand");
    detailSection.style.display = "none";
    // Increase the space for tab-pan
    document.querySelectorAll('.tab-pane').forEach(tabPane =>
            tabPane.style.height = '400px');
    document.getElementById('meetings-box').style.height = '500px';
}

function deleteMeeting(meetingId) {
    // If meeting is still pending, then can delete without sending any notification
    const meetingRef = db.collection('mentorship').doc(mentorshipID).collection('meetings').doc(meetingId);
    meetingRef.get().then(function(meeting){
        if (meeting.data().pending == false && meeting.data().accepted == true) {
            // If the meeting is already accepted, notify the other person
            // When they are notified, then delete the meeting 

            // notifyOtherPersonOfDeletionAndDelete(meetingId);
        } else { // Else, go ahead and delete right here
            deleteMeetingFromFirestore(meetingId);
            
            // Delete the meeting element from DOM
            document.getElementById(meetingId).removeChild();
        }

    })
}

function deleteMeetingFromFirestore(meetingId) {
    db.collection('mentorship').doc(mentorshipID).collection('meetings').doc(meetingId).delete();
}