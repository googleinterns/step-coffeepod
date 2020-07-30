/***********************ADD USERS TO CHAT SIDEBAR************************* */

let currUser, unsubscribe, messageDiv;
let lastMsg = true;

function getUsers(){
    auth.onAuthStateChanged(function(user) {
    if (user) {
      currUser = user.uid;
      var userInfoRef = db.collection("user-info").doc(currUser);
      userInfoRef.get().then(function(info) {
        //if user info exists
        if (info.exists){
            console.log(info.data().chats.length);
            if(info.data().chats.length > 0) updateUsers(info.data().chats);
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
function genUsers(chatID, name) {
  const temp = document.getElementById("chatTemp");
  let clone = temp.cloneNode(true);
  clone.classList.add("hand");
  clone.addEventListener('click', function(){
  //    clone.style.background = "#EAD5B8";
      openChat(chatID, name);
  })
  clone.style.display = "block";
  let cont = document.getElementById("chatCont");
  cont.appendChild(clone);
  return clone;
}

//create sidebar users of current mentors/mentees
function updateUsers(chatArr){
    chatArr.forEach(chatID => {
        let userChat;
        let userID;

        db.collection("chats").doc(chatID).get().then(snapshot => {
            if(snapshot.exists){
                console.log(snapshot.data());
                if(snapshot.data().user1 == uid) userID = snapshot.data().user2;
                else userID = snapshot.data().user1;
                db.collection("user-info").doc(userID).get().then(userInfo => {
                    if(userInfo.exists){
                        userChat = genUsers(chatID, userInfo.data().name);
                        userChat.querySelector('#name').innerText = userInfo.data().name;
                        userChat.id = chatID;
                    }
                })
            }
        }).then(()=> {
            lastMessage(chatID);
        })
    })
}

function getMostRecent(userID, chatID, text){
    let userChat = document.getElementById(chatID);
    if(userID == currUser) {
        userChat.querySelector('#lastMessage').innerText = "You: "+text;
    } else {
        userChat.querySelector('#lastMessage').innerText = text;
    }
}

function lastMessage(chatID){
    db.collection('chats').doc(chatID).onSnapshot(doc => {
        if(doc.exists){
            const msgID = doc.data().latestMessage;
            db.collection('chats').doc(chatID).collection('messages').doc(msgID).get().then(msgInfo => {
                if(msgInfo.exists){
                    const messageInfo = msgInfo.data();
                    // determine if own or other user's message
                    getMostRecent(messageInfo.userID, chatID, messageInfo.content)
                                    }
            })
        }
    })
}

/***********************INDIVIDUAL CHATS************************* */

//when user clicks on a chat, most recent messages will be loaded
function openChat(chatID, name){
    messageBox = document.querySelector('#messageBox');
    messages = messageBox.querySelector('.messages');
    messageName = document.querySelector('#messageName')
    textMessage = document.querySelector('#submitMessage');
    messageName.innerText = name;

    textMessage.style.display = 'block';
    document.querySelector('#initialMsg').style.display = 'none';

    if(lastMsg == false) unsubscribe();
    lastMsg = true;

    messages.id = chatID;
    updateChat(chatID);
}

// click on file upload button
function loadFile(){
    const fileUpload = document.querySelector('#fileUpload');
    fileUpload.click();
}

// display selected file
function displayFile(){
    const fileUpload = document.querySelector('#fileUpload').files[0];
    const file = document.querySelector('#file');
    const showFile = document.querySelector('#showFile');

    file.style.display = "block";
    if (fileUpload){
        showFile.innerHTML = fileUpload.name;
    }

}

// hide and remove selected file
function deleteFile(){
    const fileUpload = document.querySelector('#fileUpload');
    const file = document.querySelector('#file');
    const showFile = document.querySelector('#showFile');
    const progressBar = document.querySelector('#progressBar');

    fileUpload.value = '';
    showFile.innerHTML = "";
    file.style.display = "none";
    progressBar.style.display = 'none';
}

//scrolls messages to the bottom
function scrollBottom(){
    messageDiv = document.querySelector(".messages");
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

//update chat based on most recent messages
function updateChat(id){
    console.log(id);
    document.querySelector('.messages').innerText = "";
    //retrieve all messages for specific chat
    db.collection('chats').doc(id).collection('messages').orderBy("timestamp", "asc").get().then(messages => {
        if(messages){
            messages.forEach(message => {
                const messageInfo = message.data();
                let downloadURL, fileName, fileType, msgOwner;

                console.log(messageInfo.fileURL);
                if(messageInfo.fileURL){
                    downloadURL = messageInfo.fileURL;
                    fileName = messageInfo.fileName;
                    fileType = messageInfo.fileType;
                }
                if (messageInfo.userID == currUser) msgOwner = "own";
                else msgOwner = "otherUser";
                genMessage(msgOwner, messageInfo.content, fileName, fileType, downloadURL);  
            })
        }
    }).then(() => {
   //     scrollBottom();
    })
}

// generate message in chat based on who sent it and if there is a file attached
function genMessage(type, content, fileName, fileType, downloadURL){
    const temp = document.getElementById(type);
    let clone = temp.cloneNode(true);
    clone.style.display = "flex";

    if(downloadURL){
        let link =  clone.querySelector('#'+type+'Download');
        link.href = downloadURL;
        if(fileType.substring(0, fileType.indexOf("/")) == "image") {
            link.appendChild(genImage(downloadURL));
        } else {
            link.innerText = fileName.substring(fileName.indexOf("-")+1);
        }
        
    }

    clone.querySelector('#'+type+'Text').innerHTML += content;
    let cont = document.querySelector('.messages');
    cont.appendChild(clone);
    scrollBottom();
    deleteFile();
    return clone;
}

// generate an image if attached file is an image
function genImage(fileName){
    let imgEl = document.createElement('IMG');
    imgEl.src = fileName;
    imgEl.style.width = "70%";
    imgEl.style.height = "70%";
    return imgEl;
}

// store message into chats collection
function storeMessage(downloadURL, timestamp, fileName, fileType){
    let msgForm = document.querySelector('.submitMessage');
    const id = document.querySelector('.messages').id;
    const newMessage = msgForm['newTxt'].value;
    console.log(downloadURL);

    db.collection('chats').doc(id).collection('messages').add({
        userID: currUser,
        content: newMessage,
        fileURL: downloadURL,
        fileName: fileName,
        fileType: fileType,
        timestamp: timestamp
    }).then(docRef => {
        db.collection('chats').doc(id).update({
            latestMessage: docRef.id
        });
    }).then(() => {
        if(lastMsg){
            unsubscribe = db.collection('chats').doc(id).onSnapshot(doc => {
                if(doc.exists){
                    const msgID = doc.data().latestMessage;
                    db.collection('chats').doc(id).collection('messages').doc(msgID).get().then(msgInfo => {
                        if(msgInfo.exists){
                            const messageInfo = msgInfo.data();
                            console.log("sending message: "+messageInfo.fileURL);
                            genMessage("own", messageInfo.content, fileName, fileType, messageInfo.fileURL);
                            
                            //scroll down to reveal new message
                            scrollBottom();
                            msgForm.reset();
                            
                        }
                    })
                }
            })
            lastMsg = false;
        }
    })
}


// when current user types a new message or sends a file
function newMessage(e){
    e.preventDefault();
    const id = document.querySelector('.messages').id;
    const fileUpload = document.querySelector('#fileUpload').files[0];
    const progressBar = document.querySelector('#progress-bar');
    let fileName;
    let downloadURL;
    const timestamp = Date.now();
    document.querySelector('#progressBar').style.display = "flex";

    if(fileUpload){
        console.log("detect file");
        fileName = timestamp+'-'+fileUpload.name;
        const ref = firebase.storage().ref(id);
        const metadata = {
            contentType: fileUpload.type
        };
        const task = ref.child(fileName).put(fileUpload, metadata);
        task.then(snapshot => snapshot.ref.getDownloadURL()).then((url) => {
            downloadURL = url;
        }).then(() => {
            storeMessage(downloadURL, timestamp, fileName, fileUpload.type);
        }).catch(console.error);

        task.on('state_changed',
            // update progress bar of upload
            function progress(snapshot) {
                var percentage = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
                progressBar.style.width = percentage.toFixed(2)+"%";
                progressBar.innerText = percentage.toFixed(2)+'%';
            }
        )
    } else {
        fileName = null;
        downloadURL = null;
        storeMessage(null, timestamp, null, null);
    }

}
