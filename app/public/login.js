/*
    Date: 11/30/2025
    Comments from Francis for post Francis development and deployment of backend data base.
    Previously, our fetch request were simply /create-account and /login, Presumably because of local  testing
    I have switched it to "https://pinktigers-localbranchtesting.up.railway.app/" which is the Public Networking link that we have in Railway which can be found in the project component settings in Railway.
    For this one specifically, its in localbranchtesting environment which is linked to the francis-deployment-test branch. Will need to be adjusted for production release
*/


const usernameField = document.getElementById('username');
const passwordField = document.getElementById('password');
const repeatPasswordField = document.getElementById('repeatPassword');
const submitButton = document.getElementById("submit");
const createAccountMessageDiv = document.getElementById("createAccountMessage");

const username2Field = document.getElementById('username2');
const password2Field = document.getElementById('password2');
const submit2Button = document.getElementById("submit2");
const loginMessageDiv = document.getElementById("loginMessage");

// const backend = window.ENV.BACKEND_URL;
const backend = "";

function checkPasswordMatch() {
    return passwordField.value === repeatPasswordField.value;
}

function updatePasswordStyle() {
    // Reset previous styles
    passwordField.style.borderColor = '';
    repeatPasswordField.style.borderColor = '';
    createAccountMessageDiv.textContent = "";

    if (password && repeatPassword) {
        if (!checkPasswordMatch()) {
            // Highlight fields in red if passwords don't match
            passwordField.style.borderColor = 'red';
            repeatPasswordField.style.borderColor = 'red';
        } else {
            // Clear the red highlight if they match
            passwordField.style.borderColor = '';
            repeatPasswordField.style.borderColor = '';
        }
    }
}

function sendCreateAccountRequest() {
    if (!checkPasswordMatch()) {
        createAccountMessageDiv.textContent = "Passwords do not match";
        return;
    }

    fetch(`${backend}/create-account`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({
            username: usernameField.value,
            password: passwordField.value,
        }),
    }).then(response => {
        if (response.status !== 200) {
            response.json().then(body => {
                createAccountMessageDiv.textContent = body.error;
            });

            return;
        }

        window.location.replace("signedin.html");
    });
}

function sendLoginRequest() {
    fetch(`${backend}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify({
            username: username2Field.value,
            password: password2Field.value,
        }),
    }).then(response => {
        if (response.status !== 200) {
            response.json().then(body => {
                loginMessageDiv.textContent = body.error;
            });

            return;
        }

        window.location.replace("signedin.html");
    })
}

submitButton.addEventListener("click", sendCreateAccountRequest);

passwordField.addEventListener('input', updatePasswordStyle);
repeatPasswordField.addEventListener('input', updatePasswordStyle);

submit2Button.addEventListener("click", sendLoginRequest);