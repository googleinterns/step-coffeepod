window.addEventListener('click', function(e){   
  if (document.getElementById('post').contains(e.target)){
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
                replies: replies
            }).then(docRef => {
                const postID = getPostID();
                const commentID = docRef.id;
                console.log(commentID);
                db.collection('forum').doc(postID).update({
                    replies: firebase.firestore.FieldValue.arrayUnion(commentID)
                })
                offComment(); 
                form.reset();
                location.reload();
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
    document.getElementById("commentsCont").innerHTML = "";
    let button = document.getElementById("sortType");
    button.style.display = 'block';
    button.innerHTML = sort+"&nbsp;&nbsp;&nbsp;&nbsp;&times;";
    displayComments(sort);
}

function displayComments(sort){
    const postID = getPostID();
    let userID = "";
    db.collection("forum").where(firebase.firestore.FieldPath.documentId(), '==', postID).get().then(snapshot => {
        snapshot.forEach(question => {;
        const questionInfo = question.data();
        let replies = questionInfo.replies;
        // display each comment
        if (sort != "oldest") replies = replies.reverse();
        if (sort == 'all'){
            document.getElementById("commentsCont").innerHTML = "";
            document.getElementById("sortType").style.display = 'none';
        }
        replies.forEach(comntID => {
            console.log(comntID);
            let comnt = genComments();
            db.collection('comments').where(firebase.firestore.FieldPath.documentId(), '==', comntID).get().then(comntSnapshot => {
                if(!comntSnapshot.empty){
                    comntSnapshot.forEach(comntInfo => {
                        userID = comntInfo.data().userID;
                        comnt.querySelector("#date").innerText = comntInfo.data().date;
                        comnt.querySelector("#comment").innerText = comntInfo.data().content;
                        comnt.id = comntID;
                    })
                }
            }).then(() => {
                    db.collection('profile').where(firebase.firestore.FieldPath.documentId(), '==', userID).get().then(userSnapshot => {
                        if(!userSnapshot.empty){
                            userSnapshot.forEach(userInfo => {
                                comnt.querySelector("#name").innerText = userInfo.data().name;
                                comnt.querySelector("#title").innerText = userInfo.data().title;
                            })
                        }
                    })
                })
            })
        })
    })
}

function getPostID(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
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

            snapshot.forEach(post => {
                const postData = post.data();
                let userID = postData.userID;
                date.innerText = postData.date;
                question.innerText = postData.title;
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