// This file is to pull mentors/ mentees information onto current user's hub page

let myCurrentMentees, myCurrentMentors, myPastMentees, myPastMentors, mentorMentorships, menteeMentorships

class Person {
  constructor(id, name, title, location, timeStart) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.location = location;
    this.timeStart = timeStart;
  }
}

// mentorship object only stores the id of the other person because we already know that the current person is one of the person in the pair
class Mentorship {
    constructor(otherUserId, timestamp) {
        this.otherUserId = otherUserId;
        this.timestamp = timestamp;
    }
}

getMentorship();

function getMentorship() {
    auth.onAuthStateChanged(function(user) {
    if (user) {
      uid = user.uid;
      let userInfoRef = db.collection("user-info").doc(uid);

      userInfoRef.get().then(function(userInfo) {
        if (userInfo.exists) {
          
          updatePage(userInfo);

        } 
      }).catch(function(error) {
        console.log("Error getting profile:", error);
      });
    } else {
        window.location.replace("signup.html");
    }
  });
}

function updatePage(userInfo) {
    putMentorsOnPage(userInfo);
    putMenteesOnPage(userInfo);  
}

function putMentorsOnPage(userInfo) {
    const menteeOfMentorships = userInfo.data().menteeOfPairs;
    const currentUserName = userInfo.data().name;
    const myCurrentMentors = addPeopleInfo(currentUserName, menteeOfMentorships, true, false);
    return myCurrentMentors;
}

function putMenteesOnPage(userInfo) {
    const mentorOfMentorships = userInfo.data().mentorOfPairs;
    const currentUserName = userInfo.data().name;
    const myCurrentMentees = addPeopleInfo(currentUserName, mentorOfMentorships, false, false);
    return myCurrentMentees;
}


function getSectionId(isMentorList, isPast) {
    let sectionId;
    if (isMentorList && isPast) {
        sectionId = "past-mentors";
    } else if (!isMentorList && isPast) {
        sectionId = "past-mentees";
    } else if (isMentorList && !isPast) {
        sectionId = "mentors"
    } else {
        sectionId = "mentees";
    }
    return sectionId;
}

function addPeopleInfo(currentUserName, mentorshipList, isMentorList, isPast) { 
    const sectionId = getSectionId(isMentorList, isPast);

    if (mentorshipList.length == 0) {
        addNoPersonCard(sectionId)
    } else {
        addCountToSection(sectionId, mentorshipList.length);
    }

    for (mentorshipId of mentorshipList) {
        let mentorshipRef = db.collection('mentorship').doc(mentorshipId);

        mentorshipRef.get().then(function(mentorship) {

            let person, otherUserId, name, title, timeStart, location;
            timeStart = convertDateToMonthYear(mentorship.data().timestamp.toDate());

            if (isMentorList) {
                otherUserId = mentorship.data().mentorId;
            } else {
                otherUserId = mentorship.data().menteeId;
            }
            

            let otherUserProfileRef = db.collection('profile').doc(otherUserId);
            otherUserProfileRef.get().then(function(otherUserInfo) {
                name = otherUserInfo.data().name;
                title = otherUserInfo.data().title;
                location = otherUserInfo.data().location;

                if (isMentorList) {
                    mentorName = name; // mentor is the other user
                    menteeName = currentUserName; // mentee is the current user

                } else {
                    mentorName = currentUserName;
                    menteeName = name;
                }

                person = new Person(otherUserId, name, title, location, timeStart);
                addPersonCard(sectionId, person, mentorshipId, mentorName, menteeName);
            });
           
        });
        
    }
}


function addCountToSection(sectionId, count) {
    const section = document.getElementById(sectionId);
    let target = getPersonRole(sectionId);
    if (count == 1) {
        target = target.substring(0, target.length - 1);
    }
    const youHaveSection = document.getElementById("you-have-template");
    const clonedYouHave = youHaveSection.cloneNode("true");
    clonedYouHave.classList.remove("hidden");
    clonedYouHave.querySelector("span#people-num").innerHTML = count + " " + target + ".";    
    section.appendChild(clonedYouHave);
}

function getPersonRole(sectionId) {
    return sectionId.replace(/-/g,' ');
}

// add no person card to the correct section of id sectionId
function addNoPersonCard(sectionId) {
    const target = getPersonRole(sectionId);
    const parent = document.getElementById(sectionId);
    const emptySection = document.getElementById("no-one-template");
    const clonedEmptySection = emptySection.cloneNode(true);
    clonedEmptySection.classList.remove('hidden');
    clonedEmptySection.querySelector("#target").innerText = target;
    parent.appendChild(clonedEmptySection);
}

function addPersonCard(sectionId, personInfo, mentorshipId, mentorName, menteeName) {
    const parent = document.getElementById(sectionId);
    const infoCard = document.getElementById("individual-card-template");
    const clonedInfoCard = infoCard.cloneNode(true);

    clonedInfoCard.classList.remove("hidden");
    clonedInfoCard.querySelector(".ind-name").querySelector("#link-to-hub-ind").innerText = personInfo.name;

    const onclickFunction = 'goToHubInd(' + "'" + mentorshipId + "'" + "," + "'" + mentorName + "'" + "," + "'" + menteeName + "'" + ")";
    clonedInfoCard.querySelector(".ind-name").querySelector("#link-to-hub-ind").setAttribute('onclick', onclickFunction);
    clonedInfoCard.querySelector(".ind-title").innerText = personInfo.title;
    clonedInfoCard.querySelector(".ind-location").innerText = personInfo.location
    clonedInfoCard.querySelector("span#time-start").innerText = "since " + personInfo.timeStart;

    parent.appendChild(clonedInfoCard);
}

function convertDateToMonthYear(date) {
    return date.toLocaleString('default', { month: 'short'}) + " " + date.getFullYear();
}

function goToHubInd(mentorshipId, mentorName, menteeName) {
    window.location.href = "hub-ind.html?mentorshipId=" + mentorshipId + "&mentorName=" + mentorName + "&menteeName=" + menteeName;
}