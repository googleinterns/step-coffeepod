/***********************ADD USERS TO CHAT BAR************************* */

function getUsers(){
    auth.onAuthStateChanged(function(user) {
    if (user) {
      uid = user.uid;
      var userInfoRef = db.collection("user-info").doc(uid);
      userInfoRef.get().then(function(info) {
        //if user info exists
        if (info.exists){
            updateUsers(info.data().mentors);
            updateUsers(info.data().mentees);
        }
      }).catch(function(error) {
        console.log("Error getting user info:", error);
      });
    } else {
      console.log("not logged in");
    }
  });
}

//generate clone from template
function genUsers(id) {
  const temp = document.getElementById("chatTemp");
  let clone = temp.cloneNode(true);
  clone.classList.add("hand");
  clone.addEventListener('click', function(){
      openChat(id);
  })
  clone.style.display = "block";
  let cont = document.getElementById("chatCont");
  cont.appendChild(clone);
  return clone;
}

// pass in array of mentor or mentee ids
function updateUsers(userArr) {
    userArr.forEach(id => {
        let user = genUsers(id);

        db.collection("user-info").doc(id).get().then(snapshot => {
            if(snapshot.exists){
                user.querySelector("#name").innerText = snapshot.data().name;
                user.id = id;
            }
        })
    })
}

/***********************INDIVIDUAL CHATS************************* */

function openChat(id){
    messageName = document.querySelector('#messageName')
    messageName.classList.add('subpage-title');
    messageName.style.fontSize = "30px";
    messageName.innerText = id;
}

