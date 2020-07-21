// This file is to pull mentors/ mentees information onto current user's hub page

let myCurrentMentees, myCurrentMentors, myPastMentees, myPastMentors
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
      userId = user.uid;
      const userInfoRef = db.collection("user-info").doc(userId);

      userInfoRef.get().then(function(userInfo) {
        console.log(userInfo.data().menteeOfPairs);
        console.log(userInfo.exists);
        if (userInfo.exists) {
          // get list of mentorship ids
          const mentorMentorships = userInfo.data().mentorOfPairs; // current user is mentor
          const menteeMentorships = userInfo.data().menteeOfPairs; // current user is mentee
        
          //myCurrentMentees = getPersonInfoList(mentorMentorships, false);
          myCurrentMentors = getPersonInfoList(menteeMentorships, true);
          
          //updateSection("mentors", myCurrentMentors, "mentors");
          //updateSection("mentees", myCurrentMentees, "mentees");
          
          /*
          const myPastMentees = userInfo.data().pastMentorPairs;
          const myPastMentors = userInfo.data().pastMenteePairs;
          */
          //updatePage(myCurrentMentors, myCurrentMentees);
        return myCurrentMentors;
        }
      }).then (function(myCurrentMentors) {
        console.log(myCurrentMentors);
        console.log(myCurrentMentors.length);

        const section = document.getElementById("mentors");
        if (myCurrentMentors.length > 0) {// undefined or empty array
            console.log("i'm supposed to print something");
        } else {
            addNoPeopleCard(section, "mentors");
        }
      });

    } else {
      console.log("not logged in");
    }
  });
}

// personInfo is a person object
function addInfoCard(parent, personInfo) {
    const infoCard = document.getElementById("individual-card-template");
    const clonedInfoCard = infoCard.cloneNode(true);
    clonedInfoCard.classList.remove("hidden");
    clonedInfoCard.querySelector(".ind-name").innerText = personInfo.name;
    clonedInfoCard.querySelector(".ind-title").innerText = personInfo.title;
    clonedInfoCard.querySelector(".ind-location").innerText = personInfo.location
    clonedInfoCard.querySelector("#time-start").innerText = personInfo.time-start;
    clonedInfoCard.querySelector("#link-to-hub-ind").setAttribute('onclick', 'goToHubInd(' + "'" + personInfo.id + "'" +")");
    parent.appendChild(personInfo);

}
// Put the card that there are no targets on page
function addNoPeopleCard(parent, target) {
    const emptySection = document.getElementById("no-one-template");
    const clonedEmptySection = emptySection.cloneNode(true);
    clonedEmptySection.querySelector("#target").innerText = target;
    parent.appendChild(clonedEmptySection);
}

function updateSection(parentSectionId, myPeopleList, target) {
    const parentSection = document.getElementById(parentSectionId);
    console.log(myPeopleList.length);
    if (myPeopleList.length > 0) {// undefined or empty array
        console.log("i'm supposed to print something");
        for (person of myPeopleList) {
            addInfoCard(parentSection,person);
        }
    } else {
        addNoPeopleCard(section, target);
    }
}

function getPersonInfoList(mentorshipList, isMentorList) {
    return getPersonInfoFromMentorshipList(convertFromMentorship(mentorshipList, isMentorList));
} 
function getPersonInfoFromMentorshipList(mentorshipOtherIdList) {
    console.log("return a list of mentorship objects of current mentor of current user");
    console.log(mentorshipOtherIdList);
    let peopleIdList = [];

    console.log("This is right before for each");
    mentorshipOtherIdList.forEach(function(mentorship) {
        console.log("the mentorship being considered is: ");
        console.log(mentorship);
        peopleIdList.push(getPersonInfo(mentorship));
    });

    for (var mentorship in mentorshipOtherIdList) {
        console.log("the mentorship being considered is: ");
        console.log(mentorship);
        peopleIdList.push(getPersonInfo(mentorship));
    }

    console.log("the people id list should be: ");
    console.log(peopleIdList);
    return peopleIdList;
}

console.log("Get person info");
console.log(getPersonInfo(new Mentorship("Wk7lrwtTP8aJA2rVy1JGXIHpQEt2", "July 2020")));

function getPersonInfo(mentorship) {
    const profileRef = db.collection("profile").doc(mentorship.otherUserId);
    const timeStart = mentorship.timestamp;

    profileRef.get().then(function (profile) {
        const data = profile.data();
        console.log("The mentorship is:");
        console.log(mentorship);
        console.log("the person is: ");
        console.log(new Person(mentorship.otherUserId, data.name, data.title, data.location, timeStart));
        return new Person(mentorship.otherUserId, data.name, data.title, data.location, timeStart);
    })
}

// create mentorship objects with the ide of the other person and the timestamp at the point of creation of the
// mentorship
function convertFromMentorship (listMentorships, isMentorList) {
    let mentorshipRef;
    let mentorshipOtherIdList = [];

    for (mentorshipDocId of listMentorships) {
        mentorshipRef = db.collection('mentorship').doc(mentorshipDocId);
        mentorshipRef.get().then(function(mentorship) {
            if (mentorship.exists) {
                let date = mentorship.data().timestamp.toDate();
                date = convertDateToMonthYear(date);
                if (isMentorList) {// if this is a mentor list (user is a mentee)
                    mentorshipOtherIdList.push(new Mentorship(mentorship.data().mentorId, date));
                    console.log(date);
                } else {
                    mentorshipOtherIdList.push(new Mentorship(mentorship.data().menteeId, date));
                }

            } else {
                // doc.data() will be undefined in this case
                console.log("No such mentorship!");
            }
        });
    }

    return mentorshipOtherIdList;
}

function convertDateToMonthYear(date) {
    return date.toLocaleString('default', { month: 'short'}) + " " + date.getFullYear();
}

function goToHubInd(mentorshipId) {
    window.location.href = "hub-ind.html?id="+mentorshipId;
}


