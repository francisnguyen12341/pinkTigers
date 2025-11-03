const passwordField = document.getElementById('password');
const repeatPasswordField = document.getElementById('repeatPassword');

function checkPasswordsMatch() {
    const password = passwordField.value;
    const repeatPassword = repeatPasswordField.value;

    // Reset previous styles
    passwordField.style.borderColor = '';
    repeatPasswordField.style.borderColor = '';

    if (password && repeatPassword) {
        if (password !== repeatPassword) {
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

passwordField.addEventListener('input', checkPasswordsMatch);
repeatPasswordField.addEventListener('input', checkPasswordsMatch);
