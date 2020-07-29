let unsubscribe;

function saveQuestion(e){
    e.preventDefault();
    const newpost = document.getElementById("new-post");
    const topic = document.querySelector("#topic");
    const question = document.querySelector("#new-post-q");
    let sortType = document.querySelector('.sortType').id;
    let form = document.querySelector("#postForm");
    console.log(sortType);
    
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
                filterQuestions(sortType);
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

function deletePrompt(postID) {
    $(".modal").modal('toggle');
    document.querySelector('.modal').id = postID;
    console.log(document.querySelector('.modal').id);
}

// deletes own question from database and removes from page
function deleteQuestion(){
    const postID = document.querySelector('.modal').id;
    let sortType = document.querySelector(".sortType").id;
    $(".modal").modal('hide');

    db.collection("forum").doc(postID).get().then(snapshot => {
        const info = snapshot.data();
        //delete all comments before deleting post from database
        (info.replies).forEach(reply => {
            db.collection("comments").doc(reply).delete().then(() => {
                console.log("deleted comments");
            })
        })
    }).then(() => {
        db.collection("forum").doc(postID).delete().then(() => {
            console.log("delete");
            filterQuestions(sortType);
        })
    })
}

function genQuestions() {
  const temp = document.getElementById("questionsTemp");
  let clone = temp.cloneNode(true);
  clone.style.display = "block";
  let cont = document.getElementById("questionsCont");
  cont.appendChild(clone);
  return clone;
}

function sortButton(sortType){
    let button = document.querySelector(".sortType");
    button.style.display = 'block';
    button.innerHTML = sortType+"&nbsp;&nbsp;&nbsp;&nbsp;&times;";
}

function filterQuestions(type){   
    if(unsubscribe) unsubscribe();

    if ((type == "career" || type == "academics") || type == "hobbies"){
        unsubscribe = db.collection("forum").where("topic", '==', type).onSnapshot(snapshot => {
            document.getElementById("questionsCont").innerHTML = "";
            document.querySelector('.sortType').id = type;
            sortButton(type);
            return loadQuestions(snapshot);
        })
    } else if (type == "newest" || type == "oldest"){
        sortButton(type);
        document.querySelector('.sortType').id = type;
        if (type == "newest"){
            unsubscribe = db.collection("forum").orderBy("timestamp", "desc").onSnapshot(snapshot => {
                document.getElementById("questionsCont").innerHTML = "";
                return loadQuestions(snapshot);
            })
        } else {
            unsubscribe = db.collection("forum").orderBy("timestamp", "asc").onSnapshot(snapshot => {
                document.getElementById("questionsCont").innerHTML = "";
                return loadQuestions(snapshot);
            })
        }
    } else if (type == "unanswered"){
        const emptyArr = [];
        document.querySelector('.sortType').id = type;
        sortButton(type);
        unsubscribe = db.collection("forum").where("replies", '==', emptyArr).onSnapshot(snapshot => {
            document.getElementById("questionsCont").innerHTML = "";
            return loadQuestions(snapshot);
        })
    } else if (type == "all" || type == "sortType"){
        document.querySelector('.sortType').id = type;
        document.querySelector(".sortType").style.display = 'none';
        unsubscribe = db.collection("forum").onSnapshot(snapshot => {
            document.getElementById("questionsCont").innerHTML = "";
            return loadQuestions(snapshot);
        })
    } else {
        //should only appear here on initial loading of cafe
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

        db.collection('profile').doc(userID).get().then(user => {
            if(user){
                quest.querySelector("#name").innerText = user.data().name;
                quest.querySelector("#title").innerText = user.data().title;
                if(uid == userID){
                    quest.querySelector('#deletePost').style.display = "block";
                    quest.querySelector("#deletePost").id = question.id;
                }
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