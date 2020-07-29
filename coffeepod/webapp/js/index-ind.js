let unsubscribe;

window.addEventListener('click', function(e){   
  if (document.getElementById('commentForm').contains(e.target)){
      onComment();
  } else {
      offComment();
  }
});

function onComment(){
    let newComment = document.querySelectorAll(".newComment");
    let commentButton = document.querySelector("#commentButton");

    newComment.forEach(item => item.style.opacity = "1"); 
    commentButton.style.display = 'block';
}

function offComment(){
    let newComment = document.querySelectorAll(".newComment");
    let commentButton = document.querySelector("#commentButton");

    newComment.forEach(item => item.style.opacity = "0.5"); 
    commentButton.style.display = 'none'; 
}

function storeComment(e){
    e.preventDefault();
    const form = document.querySelector("#commentForm");
    const sortType = document.querySelector('.sortType').id;
    auth.onAuthStateChanged(function(user) {
        if (user) {
            uid = user.uid;
            const date = getCurrentDate();
            const timestamp = Date.now();
            let replies = [];
            db.collection('comments').add({
                userID: uid,
                date: date,
                content: document.querySelector("#new-comment").value,
                timestamp: timestamp,
                replies: replies,
                postID: getPostID()
            }).then(docRef => {
                const postID = getPostID();
                const commentID = docRef.id;
                db.collection('forum').doc(postID).update({
                    replies: firebase.firestore.FieldValue.arrayUnion(commentID)
                })
                let postPersonId;
                let postRef = db.collection('forum').doc(postID);
                postRef.get().then(function(postinfo) {
                  let following = postinfo.data().followers;
                  for(let i = 0; i < following.length; i++) {
                    db.collection('notifications').doc(following[i]).collection('postNotifications').add ({
                      filled: true,
                      followed: true,
                      postID: postID,
                      title: postinfo.data().title
                    });
                  }
                  db.collection('notifications').doc(postinfo.data().userID).collection('postNotifications').add ({
                    filled: true,
                    comment: true,
                    postID: postID,
                    title: postinfo.data().title
                  });
                }).then(function() {
                  offComment(); 
                  form.reset();
                  filterComments(sortType);
                })
            })
        }
        else {
            console.log("user not logged in");
        }
    })
}

function genComments(){
    const temp = document.getElementById("commentsTemp");
    let clone = temp.cloneNode(true);
    clone.style.display = "block";
    let cont = document.getElementById("commentsCont");
    cont.appendChild(clone);
    return clone;
}

function filterComments(sort){
    if (unsubscribe) unsubscribe();
    document.getElementById("commentsCont").innerHTML = "";
    let button = document.querySelector('.sortType');
    if(sort == "newest" || sort == "oldest"){
        button.style.display = 'block';
        button.id = sort;
        button.innerHTML = sort+"&nbsp;&nbsp;&nbsp;&nbsp;&times;";
    }

    displayComments(sort);
}

function displayComments(sort){
    const postID = getPostID();
    let userID = "";

    unsubscribe = db.collection("forum").doc(postID).onSnapshot(snapshot => {
        const questionInfo = snapshot.data();
        let replies = questionInfo.replies;
        // display each comment
        if (sort != "oldest") replies = replies.reverse();
        if (sort == 'all' || sort == 'sortType'){
            document.getElementById("commentsCont").innerHTML = "";
            document.querySelector(".sortType").style.display = 'none';
        }
        
        replies.forEach(comntID => {
            let comnt = genComments();
            db.collection('comments').doc(comntID).get().then(comntSnapshot => {
                if(comntSnapshot){
                    userID = comntSnapshot.data().userID;
                    comnt.querySelector("#date").innerText = comntSnapshot.data().date;
                    comnt.querySelector("#comment").innerText = comntSnapshot.data().content;
                    comnt.id = comntID;
                    if(userID == uid) {
                        console.log('here');
                        comnt.querySelector('#deleteComment').style.display = 'block';
                        comnt.querySelector('#deleteComment').id = comntID;
                    }
                }
            }).then(() => {
                db.collection('profile').doc(userID).get().then(userSnapshot => {
                    if(userSnapshot) {
                        comnt.querySelector("#name").innerText = userSnapshot.data().name;
                        comnt.querySelector("#title").innerText = userSnapshot.data().title;
                    }
                })
            })
        })
    })
}

function deletePrompt(commentID) {
    $(".modal").modal('toggle');
    document.querySelector('.modal').id = commentID;
    console.log(document.querySelector('.modal').id);
}

// deletes own question from database and removes from page
function deleteComment(){
    const commentID = document.querySelector('.modal').id;
    let sortType = document.querySelector(".sortType").id;
    const postID = getPostID();
    console.log(commentID);
    console.log(sortType);
    $(".modal").modal('hide');

    db.collection("forum").doc(postID).update({
        replies: firebase.firestore.FieldValue.arrayRemove(commentID)
    })
    db.collection("comments").doc(commentID).delete().then(() => {
        filterComments(sortType);
    })
}

function getPostID(){
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    return urlParams.get('id');
}

function postQuestion(){
    const id = getPostID();
    db.collection('forum').where(firebase.firestore.FieldPath.documentId(), '==', id).get().then(snapshot => {
        if(snapshot.empty) {
            window.location.replace("404.html");
        } else {
            let name = document.querySelector("#userName");
            let date = document.querySelector("#postDate");
            let title = document.querySelector("#userTitle");
            let question = document.querySelector("#postQuestion");
            let content = document.querySelector("#postContent");
            let followBut = document.querySelector(".follow");

            snapshot.forEach(post => {
                const postData = post.data();
                let userID = postData.userID;
                date.innerText = postData.date;
                question.innerText = postData.title;
                followBut.id = post.id;
                content.innerText = postData.content;
                
                db.collection('profile').where(firebase.firestore.FieldPath.documentId(), '==', userID).get().then(userSnapshot => {
                    if(!userSnapshot.empty){
                        userSnapshot.forEach(user => {
                            name.innerText = user.data().name;
                            title.innerText = user.data().title;
                        })
                    }
                })
            }) 
        } 
    })
}