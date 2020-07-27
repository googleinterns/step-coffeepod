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
   firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      // this person isn't signed in so we should redirect them
      window.location.replace("login.html")
    } 
  });
  if(fromWhere != null) {
    $.get("navbar.html", function(data){
      $("#nav-placeholder").replaceWith(data).promise().done(function() {
        document.getElementById(fromWhere).classList.add('active');
      });
    });
  }
  $.get("footer.html", function(data){
    $("#footer-placeholder").replaceWith(data);
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