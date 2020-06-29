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

function load(fromWhere){
  document.getElementById(fromWhere).classList.add('active');
  console.log(document.getElementById(fromWhere));
}

$.get("navbar.html", function(data){
    $("#nav-placeholder").replaceWith(data);
});

// $(document).ready(function() {
//     console.log($('a[href="' + this.location.pathname + '"]').parent());
//     $('a[href="' + this.location.pathname + '"]').parent().addClass('active');
// });