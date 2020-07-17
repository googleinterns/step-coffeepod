let name, uid, user, username, mentors, mentees, tags, people;

// load the users find page
function loadFind() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      name = user.displayName;
      uid = user.uid;
      let userRef = db.collection("user-info").doc(uid);
      userRef.get().then(function(userinfo) {
        username = userinfo.data().username;
        mentors = userinfo.data().mentors;
        mentees = userinfo.data().mentees;
      });
      let profileRef = db.collection("profile").doc(uid);
      profileRef.get().then(function(profile) {
        if (profile.exists) {
          // get the profile information that is needed
          tags = profile.data().tags;
        } else {
          // doc.data() will be undefined in this case
          console.log("No such profile!");
        }
      }).then(function() {
        if(tags === undefined) {
            document.getElementById("noTags").classList.remove("hidden");
          } else {
            getPeople();
          }
      });
    } else {
      // not logged in do something
    }
  });
}

// get all the people
function getPeople() {
  let peopleList = [];
  db.collection("profile").where("tagSize", ">", 0).get().then(function(querySnapshot) {
    querySnapshot.forEach(function(profile) {
      if(profile.data().username != username) {
        let overlap = tags.filter(value => profile.data().tags.includes(value));
        peopleList.push({similarity: overlap.length, id: profile.id, data: profile.data(), overlapTags: overlap});
        // doc.data() is never undefined for query doc snapshots
        console.log(overlap);
      }
    });
    peopleList.sort((a, b) => (a.similarity > b.similarity) ? -1:1);
    loadMatches(peopleList);
  });
}

// method that loads the mentor cards in the order of how many tags they share
function loadMatches(matches) {
  matches.forEach(function(mentor) {
    let card = makeMentorCard();
    card.querySelector(".nameMentor").innerText = mentor.data.name;
    card.querySelector(".titleMentor").innerText = mentor.data.title;
    card.id = mentor.id;
    card.querySelector(".nameMentor").setAttribute('href', 'profile.html?user=' + mentor.id);
  });
}

// makes a new form for the experience section
function makeMentorCard() {
  let form = document.getElementById("mentorCardTemp");
  let clone = form.cloneNode(true);
  clone.style.display = "block";
  let cont = document.getElementById("sugMentor");
  cont.appendChild(clone);
  return clone;
}