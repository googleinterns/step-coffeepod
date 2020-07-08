//login using username/email and password
function login(e) {
    e.preventDefault();
    var valid = false;
    const loginForm = document.getElementById("login-form");
    const user = loginForm['username'].value;
    const password = loginForm['password'].value;

    auth.signInWithEmailAndPassword(user, password).then(cred => {
        valid = true;
        loginForm.querySelector("#error").innerHTML = "";
        window.location.replace("index.html");
        console.log(cred.user);
    }).catch(() => {
        // check if user used username to login
        db.collection('user-info').get().then(snapshot => {
            (snapshot.docs).forEach(doc => {
                const userInfo = doc.data();
                if (userInfo.username == user) {
                    auth.signInWithEmailAndPassword(userInfo.email, password).then(() => {
                        console.log(userInfo.username);
                        valid = true;
                        console.log(valid);
                        window.location.replace("index.html");
                        return false;
                    }).catch(() => {
                        //incorrect password
                        console.log("first err");
                        loginForm.querySelector("#error").innerHTML = "Invalid username/email or password.";
                    })
                }
            })
        })
    }).then(() => {
        if (valid == false){
            console.log(valid);
            console.log("second err");
            loginForm.querySelector("#error").innerHTML = "Invalid username/email or password.";

        }
    })
}

//signing up while also making sure there are no duplicate usernames/emails
function signup(e) {
    e.preventDefault();
    var valid = true;
    const signupForm = document.getElementById("signup-form");
    const username = signupForm['username'].value
    const email = signupForm['email'].value;
    const password = signupForm["password"].value;
    const copassword = signupForm["copassword"].value;
    const month = signupForm['month'].value;
    const day = signupForm['day'].value;
    const year = signupForm['year'].value;

    signupForm.querySelector("#username-error").innerHTML ='';
    signupForm.querySelector("#password-error").innerHTML ='';
    signupForm.querySelector("#email-error").innerHTML ='';

    /*
    //check for username uniqueness
    db.collection('user-info').get().then(snapshot => {
        (snapshot.docs).forEach(doc => {
            const userInfo = doc.data();
            console.log(userInfo);
            if (userInfo.username == username) {
                signupForm.querySelector("#username-error").innerHTML = "Username taken.";
                valid = false;
            }
        })
    })*/

    //check to see if passwords match
    if (copassword != password) {
        signupForm.querySelector("#password-error").innerHTML = "Passwords do not match.";
        valid = false;
    } 

    if ((month == "Month" || day == "Day") || year == "Year"){
        signupForm.querySelector("#birthday-error").innerHTML = "Please enter your birthday.";
    }

    //create account if checks pass
    if (valid == true){
        auth.createUserWithEmailAndPassword(email, password).then(cred => {
            db.collection('profile').doc(cred.user.uid).set({
                username: username,
                name: signupForm['firstName'].value+" "+signupForm['lastName'].value,
                about: "Edit your page to add a bio"
            });
            return db.collection('user-info').doc(cred.user.uid).set({
                username: username,
                email: email,
                name: signupForm['firstName'].value+" "+signupForm['lastName'].value,
                dob: month+" "+day+", "+year
            })
        }).catch((err) => {
            signupForm.querySelector("#email-error").innerHTML = err.message;
            valid = false;
        }).then(() => {
            window.location.href = "index.html";
        })
    }
}

// create days and years
function dobSelect(){
    const daySelect = document.getElementById('day');
    const yearSelect = document.getElementById('year');
    for (var i = 1; i <= 31; i++){
        // appending options to month
        daySelect.appendChild(createOptionValues("day", i));
    }
    for(var i = 2020; i>= 1900; i--){
        yearSelect.appendChild(createOptionValues("year",i));
    }
}

function createOptionValues(type, num){
    const optionEl = document.createElement('option');
    optionEl.value = num.toString();
    optionEl.innerHTML = num.toString();
    optionEl.id = type+num.toString();
    optionEl.className = "roboto xs"
    return optionEl;
}