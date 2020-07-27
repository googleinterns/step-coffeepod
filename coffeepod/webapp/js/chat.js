/***********************ADD USERS TO CHAT BAR************************* */

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
    messageName.innerText = name;

    if(lastMsg == false) unsubscribe();
    lastMsg = true;

    messages.id = chatID;
    updateChat(chatID);
}

function loadFile(){
    const fileUpload = document.querySelector('#fileUpload');
    fileUpload.click();
//    fileUpload.value = URL.createObjectURL(e.target.files[0]);
}

function displayFile(){
    const fileUpload = document.querySelector('#fileUpload').files[0];
    const file = document.querySelector('#file');
    const showFile = document.querySelector('#showFile');

    file.style.display = "block";
    if (fileUpload){
        showFile.innerHTML = fileUpload.name;
    }

}

function deleteFile(){
    const fileUpload = document.querySelector('#fileUpload');
    const file = document.querySelector('#file');
    const showFile = document.querySelector('#showFile');

    fileUpload.value = '';
    showFile.innerHTML = "";
    file.style.display = "none";
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

function genMessage(type, content, fileName, fileType, downloadURL){
    const temp = document.getElementById(type);
    let clone = temp.cloneNode(true);
    clone.style.display = "flex";

    if(downloadURL){
        let link =  clone.querySelector('#'+type+'Download');
        link.href = downloadURL;
        link.innerText = fileName.substring(fileName.indexOf("-")+1);
     //   clone.querySelector('.'+type+'Msg').innerHTML += "\n";
    }

    clone.querySelector('#'+type+'Text').innerHTML += content;
    let cont = document.querySelector('.messages');
    cont.appendChild(clone);
    scrollBottom();
    deleteFile();
    return clone;
}

function storeMessage(downloadURL, timestamp, fileName, fileType){
    let msgForm = document.querySelector('.submitMessage');
    const id = document.querySelector('.messages').id;
    const newMessage = msgForm['newTxt'].value;

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
                            // determine if own or other user's message
                            if (messageInfo.userID == currUser) genMessage("own", messageInfo.content, fileName, fileType, downloadURL);
                            else genMessage("otherUser", messageInfo.content, fileName, fileType, downloadURL);
                            
                            //scroll down to reveal new message
                            scrollBottom();
                        }
                    })
                }
            })
            lastMsg = false;
        }
    })
    msgForm.reset();
}


// when current user types a new message or sends a file
function newMessage(e){
    e.preventDefault();
    const id = document.querySelector('.messages').id;
    const fileUpload = document.querySelector('#fileUpload').files[0];
    let fileName;
    let downloadURL;
    const timestamp = Date.now();

    if(fileUpload){
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
    } else {
        fileName = null;
        downloadURL = null;
        storeMessage(downloadURL, timestamp, fileName, null);
    }

}

