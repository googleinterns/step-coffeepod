const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const mentorshipID = getMentorshipId();


class HubName {
    constructor(mentorName, menteeName, mentorTitle, menteeTitle) {
        this.mentorName = mentorName;
        this.menteeName = menteeName;
        this.mentorTitle = mentorTitle;
        this.menteeTitle = menteeTitle;
    }
}

function getMentorshipId(){
    return urlParams.get('mentorshipId');
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
    return new HubName(urlParams.get('mentorName'), urlParams.get('menteeName'), urlParams.get('mentorTitle'), urlParams.get('menteeTitle'));
} 

function loadData() {
    getGoalCards();
    addOpeningContent();
    
}
