const usernameField = document.getElementById('username');
const passwordField = document.getElementById('password');
const repeatPasswordField = document.getElementById('repeatPassword');
const submitButton = document.getElementById("submit");
const createAccountMessageDiv = document.getElementById("createAccountMessage");

const username2Field = document.getElementById('username2');
const password2Field = document.getElementById('password2');
const submit2Button = document.getElementById("submit2");
const loginMessageDiv = document.getElementById("loginMessage");

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

    fetch("https://pinktigers-localbranchtesting.up.railway.app/create-account", {
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
    fetch("https://pinktigers-localbranchtesting.up.railway.app/login", {
        method: "POST",
        redentials: "include",
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