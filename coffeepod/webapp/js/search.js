let searchVal;
let string = window.location.search;
let param = new URLSearchParams(string);
let val = param.get('search');

function search(e) {
  e.preventDefault();
  console.log("click")
  window.location.href='search.html?search=' + document.getElementById("searchbar").value.toLowerCase();
  console.log("search for" + document.getElementById("searchbar").value);
  
}

// method to load the user matches from firestore
function loadSearch() {
  let brk = val.split(" ");
  let ids = [];
  let count = 0;
  console.log(brk);
  for(let i = 0; i < brk.length; i++) {
    console.log(brk[i].toLowerCase())
    // check each word against the first, last, and usernamea name of people
    db.collection("profile").where("firstName", "==", brk[i].toLowerCase()).get().then(querySnapshot => {
      querySnapshot.forEach(person => {
        ids.push(person.id);
        loadPerson(person);
        count++;
      });
    }).then(function() {
      db.collection("profile").where("lastName", "==", brk[i].toLowerCase()).get().then(querySnapshot => {
        querySnapshot.forEach(person => {
          if(!ids.includes(person.id)) {
            ids.push(person.id);
            loadPerson(person);
            count++;
          }
        });
      }).then(function() {
      db.collection("profile").where("username", "==", brk[i].toLowerCase()).get().then(querySnapshot => {
        querySnapshot.forEach(person => {
          if(!ids.includes(person.id)) {
            ids.push(person.id);
            loadPerson(person);
            count++;
          }
          });
        }).then(function() {
          if(count == 0) {
            document.getElementById("noResults").classList.remove("hidden");
          }
        });
      });
    });
  }
}

// method that loads the mentor cards in the order of how many tags they share
function loadPerson(person) {
  let card = makePerson();
  card.querySelector(".nameMentor").innerText = person.data().name;
  card.querySelector(".titleMentor").innerText = person.data().title;
  card.id = person.id;
  card.querySelector(".nameMentor").setAttribute('href', 'profile.html?user=' + person.id);
}

// makes a new form for the experience section
function makePerson() {
  let form = document.getElementById("personTemp");
  let clone = form.cloneNode(true);
  clone.style.display = "block";
  let cont = document.getElementById("people");
  cont.appendChild(clone);
  return clone;
}