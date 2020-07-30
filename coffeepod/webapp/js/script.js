// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
function logOut(e){
    e.preventDefault();
    firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
    })
}

// red dot appears next to notification when user has new notifications
function getNotif(){
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const currUser = user.uid;
            const notif = document.querySelector("#notifications");
            const notifBell = notifications.querySelector('.dot');

            firebase.firestore().collection("notifications").doc(currUser).onSnapshot(snapshot => {
                const notifInfo = snapshot.data();
                if (notifInfo.menteeRequests.length > 0 || notifInfo.mentorRequests.length > 0){
                    console.log("mentee/mentor notif");
                    return notifBell.style.visibility = "visible";
                }
            })
                firebase.firestore().collection("notifications").doc(currUser).collection("postNotifications").onSnapshot(snapshot => {
                    if(snapshot.size > 0){
                        console.log(snapshot.size);
                        console.log("postnotif");
                        return notifBell.style.visibility = "visible";
                    }
                })
                firebase.firestore().collection("notifications").doc(currUser).collection("meetingNotifs").onSnapshot(snapshot => {
                    if(snapshot.size > 0){
                        console.log("meetingnotif");
                        return notifBell.style.visibility = "visible";
                    }
                })
            
            
            console.log("no notif");
            notifBell.style.visibility = "hidden";
        }
    })
}



function load(fromWhere){
   firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      // this person isn't signed in so we should redirect them
      window.location.replace("login.html")
    } 
  });
  $.get("navbar.html", function(data){
    $("#nav-placeholder").replaceWith(data).promise().done(function() {
    if(fromWhere != null) {
      document.getElementById(fromWhere).classList.add('active');
    }
    });
  });
  $.get("footer.html", function(data){
    $("#footer-placeholder").replaceWith(data);
  });
}

function getCurrentUser() {
    auth.onAuthStateChanged(function(user) {
    if (user) {
      uid = user.uid;
      let profileRef = db.collection("profile").doc(uid);
      profileRef.get().then(function(profile) {
        if (profile.exists) {
            const name = profile.data().name;
            const nameHolder = document.getElementById("current-user-name");
            nameHolder.innerText = name;

            const titleHolder = document.getElementById("current-user-title");
            if (titleHolder != null) {
                titleHolder.innerText = profile.data().title;
            }
            
        } 
      })
    } 
  });
}

function showAbout() {
  if(document.getElementById("aboutCoffee").classList.contains("hidden")) {
    if(!document.getElementById("whyCoffee").classList.contains("hidden")) {
      document.getElementById("whyCoffee").classList.add("hidden");
    }
    document.getElementById("aboutCoffee").classList.remove("hidden");
    document.getElementById("intro").classList.add("hidden");
  } else {
    document.getElementById("aboutCoffee").classList.add("hidden");
    document.getElementById("intro").classList.remove("hidden");
  }
}

function showUs() {
  if(document.getElementById("whyCoffee").classList.contains("hidden")) {
    if(!document.getElementById("aboutCoffee").classList.contains("hidden")) {
    document.getElementById("aboutCoffee").classList.add("hidden");
    }
    document.getElementById("whyCoffee").classList.remove("hidden");
    document.getElementById("intro").classList.add("hidden");
  } else {

    document.getElementById("whyCoffee").classList.add("hidden");
    document.getElementById("intro").classList.remove("hidden");
  }
}


