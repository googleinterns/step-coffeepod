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


// $(document).ready(function() {
//   $.get("navbar.html", function(data){
//     $("#nav-placeholder").replaceWith(data).promise().done(function() {
//       document.getElementById(fromWhere).classList.add('active');
//     });
//   });

//   $.get("footer.html", function(data){
//     $("#footer-placeholder").replaceWith(data);
//   });
// });

function logOut(e){
    e.preventDefault();
    firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
    })
}

function load(fromWhere){
  console.log(fromWhere);
  $.get("navbar.html", function(data){
    $("#nav-placeholder").replaceWith(data).promise().done(function() {
      document.getElementById(fromWhere).classList.add('active');
    });
  });

  $.get("footer.html", function(data){
    $("#footer-placeholder").replaceWith(data);
  });

  $.get("goals.html", function(data){
    $("#goals-placeholder").replaceWith(data);
  });
}
