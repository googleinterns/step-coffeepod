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

function load(fromWhere){
  $.get("navbar.html", function(data){
    $("#nav-placeholder").replaceWith(data).promise().done(function() {
      document.getElementById(fromWhere).classList.add('active');
      // var input = document.getElementById("searchbar");
      // console.log(input);
      // input.addEventListener("keyup", function(event) {
      //   if (event.keyCode === 13) {
      //     event.preventDefault();
      //     document.getElementById("myBtn").click();
      //   }
      // });
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
        } 
      })
    } 
  });
}