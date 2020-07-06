const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCMwJGcLe1xL9TB46KTDQPTjoXvVgnjgeA",
  authDomain: "team-hi-five-step.firebaseapp.com",
  databaseURL: "https://team-hi-five-step.firebaseio.com",
  projectId: "team-hi-five-step",
  storageBucket: "team-hi-five-step.appspot.com",
  messagingSenderId: "296440646158",
  appId: "1:296440646158:web:d06db7292a4cc92d714a5f",
  measurementId: "G-SV4KD1V658"
};
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var name, email, photoUrl, uid, emailVerified;
var user = firebase.auth().currentUser;

function getProfile() {
  if (user) {
    // User is signed in.
    name = user.displayName;
    email = user.email;
    photoUrl = user.photoURL;
    emailVerified = user.emailVerified;
    uid = user.uid;
  } else {
    // No user is signed in.
  }
}