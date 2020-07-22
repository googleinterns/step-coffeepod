const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const mentorshipID = getMentorshipId();


class HubName {
    constructor(mentorName, menteeName) {
        this.mentorName = mentorName;
        this.menteeName = menteeName;
    }
}

function getMentorshipId(){
    return urlParams.get('mentorshipId');
}

function addMentorshipHubName() {
    const hubName = getMentorshipHubName(mentorshipID);

    const hubTitle = document.getElementById("subpage-title");
    hubTitle.querySelector("span#mentor-name").innerText = hubName.mentorName;
    hubTitle.querySelector("span#mentee-name").innerText = hubName.menteeName;
}

function getMentorshipHubName() {
    return new HubName(urlParams.get('mentorName'), urlParams.get('menteeName'));
} 

function loadData() {
    getGoalCards();
    addMentorshipHubName();
}
