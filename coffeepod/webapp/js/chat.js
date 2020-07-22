/***********************ADD USERS TO CHAT BAR************************* */
let currUser, unsubscribe;
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

function updateUsers(chatArr){
    chatArr.forEach(chatID => {
        let userChat;
        let userID;
        lastMessage(chatID);

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
        })
    })
}

function lastMessage(chatID){
    console.log("updating last message");
    db.collection('chats').doc(chatID).onSnapshot(doc => {
        if(doc.exists){
            const msgID = doc.data().latestMessage;
            db.collection('chats').doc(chatID).collection('messages').doc(msgID).get().then(msgInfo => {
                if(msgInfo.exists){
                    const messageInfo = msgInfo.data();
                    // determine if own or other user's message
                    document.querySelector('#lastMessage').innerText = messageInfo.content;
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
    console.log(lastMsg);
}

//update chat based on most recent messages
function updateChat(id){
    console.log(id);
    document.querySelector('.messages').innerText = "";
    //retrieve all messages for specific chat
    db.collection('chats').doc(id).collection('messages').orderBy("timestamp", "asc").get().then(messages => {
        console.log(messages);
        if(messages){
            messages.forEach(message => {
                const messageInfo = message.data();
                // determine if own or other user's message
                if (messageInfo.userID == currUser) genMessage("own", ".ownMsg", messageInfo.content);
                else genMessage("otherUser", ".otherUserMsg", messageInfo.content);
            })
        }
    })
}

function genMessage(type, typeMsg, content){
    const temp = document.getElementById(type);
    let clone = temp.cloneNode(true);
    clone.style.display = "flex";
    clone.querySelector(typeMsg).innerText = content;
    let cont = document.querySelector('.messages');
    cont.appendChild(clone);
    return clone;
}

// when current user types and sends a message
function newMessage(e){
    e.preventDefault();
    let msgForm = document.querySelector('.submitMessage');
    let id = document.querySelector('.messages').id;
    let newMessage = msgForm['newTxt'].value;
    let timestamp = Date.now();
    
    console.log(lastMsg);

    db.collection('chats').doc(id).collection('messages').add({
        userID: currUser,
        content: newMessage,
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
                            console.log(messageInfo.content);
                            // determine if own or other user's message
                            document.querySelector('#lastMessage').innerText = messageInfo.content;
                            if (messageInfo.userID == currUser) genMessage("own", ".ownMsg", messageInfo.content);
                            else genMessage("otherUser", ".otherUserMsg", messageInfo.content);
                        }
                    })
                }
            })
            lastMsg = false;
        }
    })

    msgForm.reset();

}

