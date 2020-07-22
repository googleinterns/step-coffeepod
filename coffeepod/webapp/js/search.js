let searchVal;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const val = urlParams.get('search');

function search() {
  let search = document.getElementById("searchbar").value;
  window.location.href='search.html?search=' + search;
  
}

function loadSearch() {
  console.log(val);
}