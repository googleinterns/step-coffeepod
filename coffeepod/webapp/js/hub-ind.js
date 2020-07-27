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
    console.log("get all upcoming meetings - meetings that have been accepted");
    let meetingCount = 0;
    meetingsRef.where('when', '>', Date.now()).where('accepted', '==', true).orderBy("when", "asc").get().then(function (meetings) {
        meetings.forEach(meeting => {
            meetingCount += 1;
            addMeetingToList("upcoming-meeting-list", meeting.data().id, meeting.data().when);
        });
            document.getElementById("num-upcoming").innerText = meetingCount;
            document.getElementById("upcoming-meeting-list").classList.remove('hidden');
    });
}

function getPendingMeetings() {
    const meetingsRef = db.collection('mentorship').doc(mentorshipID).collection('meetings');
    console.log("get all pending meetings - meetings that have been not been accepted but are still pending");
    let meetingCount = 0;
    meetingsRef.where('when', '>', Date.now()).where('pending', '==', true).orderBy("when", "asc").get().then(function (meetings) {
        meetings.forEach(meeting => {
            meetingCount += 1;
            addMeetingToList("pending-meeting-list", meeting.data().id, meeting.data().when);
        });
            document.getElementById("num-pending").innerText = meetingCount;
            document.getElementById("pending-meeting-list").classList.remove('hidden');
    });
}

function getPastMeetings() {
    const meetingsRef = db.collection('mentorship').doc(mentorshipID).collection('meetings');
    console.log("get all pending meetings - meetings that have been not been accepted but are still pending");
    let meetingCount = 0;
    meetingsRef.where('when', '<=', Date.now()).where('pending', '==', false).where('accepted', '==', true).orderBy("when", "asc").get().then(function (meetings) {
        meetings.forEach(meeting => {
            meetingCount += 1;
            addMeetingToList("past-meeting-list", meeting.data().id, meeting.data().when);
        });
        console.log("past meeting count: " + meetingCount);
        document.getElementById("num-past").innerText = meetingCount;
        document.getElementById("past-meeting-list").classList.remove('hidden');
    });
}


function addMeetingToList(listId, meetingId, meetingWhen){
    const meetingList = document.getElementById(listId);

    const meetingLiEle = document.getElementById("meeting-ele")
    const meetingLiEleCloned = meetingLiEle.cloneNode(true);
    meetingLiEleCloned.classList.remove('hidden');

    const meetingDate = meetingLiEleCloned.querySelector("#meeting-date");
    meetingDate.innerText = new Date(meetingWhen);
    meetingDate.setAttribute('onclick', 'showMeetingDetail(' + meetingId + ')')

    meetingList.appendChild(meetingLiEleCloned);
}
