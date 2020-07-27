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

/*function getAcceptedMeetings() {
    const meetingsRef = db.collection('mentorship').doc(mentorshipID).collection('meetings');
    meetingsRef.where('when', '>', Date.now()).where('accepted', '==', true).get().then(function (meetingRef{
        console.log()
    })
}*/

