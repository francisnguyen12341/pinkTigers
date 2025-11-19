const logoutButton = document.getElementById("logout");
const logoutMessageDiv = document.getElementById("logoutMessage");

function sendLogoutRequest() {
    fetch("/logout", {
        method: "DELETE",
        credentials: "include",
    }).then(response => {
        if (response.status !== 200) {
            response.json().then(body => {
                logoutMessageDiv.textContent = body.error;
            });
            
            return;
        }

        window.location.replace("login.html");
    });
}

logoutButton.addEventListener("click", sendLogoutRequest);
