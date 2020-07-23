const queryStringHubInd = window.location.search;
const urlParamsHubInd = new URLSearchParams(queryStringHubInd);
const mentorshipID = getMentorshipId();

// WELCOME SECTION
class HubName {
    constructor(mentorName, menteeName, mentorTitle, menteeTitle) {
        this.mentorName = mentorName;
        this.menteeName = menteeName;
        this.mentorTitle = mentorTitle;
        this.menteeTitle = menteeTitle;
    }
}

function getMentorshipId(){
    return urlParamsHubInd.get('mentorshipId');
}

function addOpeningContent() {
    addMentorshipHubName();
    addContentMentorshipCard();
}

function addContentMentorshipCard() {
    const hubName = getMentorshipHubName();

    document.getElementById("mentor-card-name").innerText = hubName.mentorName;
    document.getElementById("mentee-card-name").innerText = hubName.menteeName;
    document.getElementById("mentor-card-title").innerText= hubName.mentorTitle;
    document.getElementById("mentee-card-title").innerText = hubName.menteeTitle;
}

function addMentorshipHubName() {
    const hubName = getMentorshipHubName();

    const hubTitle = document.getElementById("subpage-title");
    hubTitle.querySelector("span#mentor-name").innerText = hubName.mentorName;
    hubTitle.querySelector("span#mentee-name").innerText = hubName.menteeName;
}

function getMentorshipHubName() {
    return new HubName(urlParamsHubInd.get('mentorName'), urlParamsHubInd.get('menteeName'), urlParamsHubInd.get('mentorTitle'), urlParamsHubInd.get('menteeTitle'));
} 

function loadData() {
    getGoalCards();
    addOpeningContent();
    addOverview();
}

// OVERVIEW SECTION
function addOverview() {
    addNumGoalCards();
    addTimeStart();
}

function addTimeStart() {
    const timeStart = urlParamsHubInd.get('timeMilli');
    console.log(timeStart);
    document.getElementById("start-time").innerText = fromMillisecondsToMonthAndYear(timeStart);
}


function fromMillisecondsToMonthAndYear(milliseconds) {
    const date = new Date(parseInt(milliseconds));
    return date.toLocaleString('default', { month: 'long'}) + " " + date.getFullYear();
}

