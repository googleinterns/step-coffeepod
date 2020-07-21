function saveQuestion(e){
    const newpost = document.getElementById("new-post");
    const topic = document.querySelector("#topic");
    const question = document.querySelector("#new-post-q");
    let form = document.querySelector("#postForm");
    e.preventDefault();
    auth.onAuthStateChanged(function(user) {
        if (user) {
            uid = user.uid;
            let date = getCurrentDate();
            let timestamp = Date.now();
            let replies = [];
            db.collection('forum').add({
                userID: uid,
                topic: topic.value,
                date: date,
                title: question.value,
                content: newpost.value,
                timestamp: timestamp,
                replies: replies,
                followers: []
            }).then(() => {
                blurPost();  
                form.reset();
                location.reload();
            })
        }
        else {
            console.log("user not logged in");
        }
    })
}

function newPost(){
    var post = document.getElementById("post");
    var newpost = document.getElementById("new-post");
    var button = document.getElementById("postButton");
    var navbar = document.querySelector(".navbar");
    var footer = document.querySelector(".footer");
    var topic = document.querySelector("#topic");
    var question = document.querySelector("#new-post-q");

    post.classList.remove("shadow-sm");
    post.classList.add("dim-back");
    newpost.style.display = "block";
    newpost.rows = "10";
    button.style.display = "block";
    navbar.classList.add("dimmed");
    footer.classList.add("dimmed");
    topic.style.display = "block";
    question.placeholder = "Enter your question here.";
    question.rows = "1";

    var postContainer = document.querySelectorAll(".newPostContainer");
    postContainer.forEach(item => item.style.opacity = "1");

}

function blurPost(){
    var post = document.getElementById("post");
    var newpost = document.getElementById("new-post");
    var button = document.getElementById("postButton");
    var navbar = document.querySelector(".navbar");
    var footer = document.querySelector(".footer");
    var topic = document.querySelector("#topic");
    var question = document.querySelector("#new-post-q");
    post.classList.add("shadow-sm");
    post.classList.remove("dim-back");

    newpost.style.display = "none";

    button.style.display = "none";

    navbar.classList.remove("dimmed");
    footer.classList.remove("dimmed");

    topic.style.display = "none";
    question.placeholder = "Any questions on your mind today?"

    var postContainer = document.querySelectorAll(".newPostContainer");
    postContainer.forEach(item => item.style.opacity = "0.5");
}

window.addEventListener('click', function(e){   
  if (document.getElementById('post').contains(e.target) || document.getElementById('askQuestion').contains(e.target)){
      newPost();
  } else {
      // Clicked outside form div
      blurPost();
  }
});

function genQuestions() {
  const temp = document.getElementById("questionsTemp");
  let clone = temp.cloneNode(true);
  clone.style.display = "block";
  let cont = document.getElementById("questionsCont");
  cont.appendChild(clone);
  return clone;
}

function sortButton(sortType){
    let button = document.getElementById("sortType");
    button.style.display = 'block';
    button.innerHTML = sortType+"&nbsp;&nbsp;&nbsp;&nbsp;&times;";
}

function filterQuestions(type){
 //   let res;
    if ((type == "career" || type == "academics") || type == "hobbies"){
        db.collection("forum").where("topic", '==', type).get().then(snapshot => {
            document.getElementById("questionsCont").innerHTML = "";
            sortButton(type);
            return loadQuestions(snapshot);
        })
    } else if (type == "newest" || type == "oldest"){
        sortButton(type);
        document.getElementById("questionsCont").innerHTML = "";
        if (type == "newest"){
            db.collection("forum").orderBy("timestamp", "desc").onSnapshot(snapshot => {
                return loadQuestions(snapshot);
            })
        } else {
            db.collection("forum").orderBy("timestamp", "asc").onSnapshot(snapshot => {
                console.log(snapshot);
                return loadQuestions(snapshot);
            })
        }
    } else if (type == "unanswered"){
        const emptyArr = [];
        sortButton(type);
        db.collection("forum").where("replies", '==', emptyArr).get().then(snapshot => {
            document.getElementById("questionsCont").innerHTML = "";
            return loadQuestions(snapshot);
        })
    } else if (type == "all"){
        document.getElementById("sortType").style.display = 'none';
        console.log("all");
        document.getElementById("questionsCont").innerHTML = "";
        db.collection("forum").get().then(snapshot => {
            return loadQuestions(snapshot);
        })
    } else {
        db.collection("forum").get().then(snapshot => {
            return loadQuestions(snapshot);
        })
    }
}

function loadQuestions(snapshot) {
  if (snapshot != null){
    snapshot.forEach(question => {
    const questionInfo = question.data();
    const userID = questionInfo.userID;
    let quest = genQuestions();

    db.collection('profile').where(firebase.firestore.FieldPath.documentId(), '==', userID).get().then(snapshot => {
        if(!snapshot.empty){
            snapshot.forEach(user => {
            quest.querySelector("#name").innerText = user.data().name;
            quest.querySelector("#title").innerText = user.data().title;
            })
        }
    }).then(() => {
        quest.querySelector("#date").innerText = questionInfo.date;
        quest.querySelector("#question").innerText = questionInfo.title;
        quest.querySelector("#content").innerText = questionInfo.content;
        quest.querySelector('#seeMore').id = question.id;
        quest.querySelector(".follow").id = question.id;
        quest.id = question.id;
        checkFollowOne(quest.querySelector(".follow"), false);
        })
    });
  }
  console.log("finished");
}

function passId(postId) {
    window.location.href = "index-ind.html?id="+postId;

}