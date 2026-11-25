
// GREENWICH - Local Authentication

const USERS_KEY = "greenwichUsers";
const CURRENT_USER_KEY = "greenwichCurrentUser";

// Get registered users
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// Save users
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Registration
const registerForm = document.querySelector("#register-form");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.querySelector("#register-name").value.trim();
        const email = document.querySelector("#register-email").value.trim().toLowerCase();
        const password = document.querySelector("#register-password").value;
        const confirmPassword = document.querySelector("#register-confirm-password").value;
        const message = document.querySelector("#register-message");

        const users = getUsers();

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            message.style.color = "red";
            return;
        }

        if (users.some(user => user.email === email)) {
            message.textContent = "An account with this email already exists.";
            message.style.color = "red";
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password
        };

        users.push(newUser);
        saveUsers(users);

        message.textContent = "Account created successfully! Redirecting to login...";
        message.style.color = "green";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
    });
}

// Login
const loginForm = document.querySelector("#login-form");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.querySelector("#login-email").value.trim().toLowerCase();
        const password = document.querySelector("#login-password").value;
        const message = document.querySelector("#login-message");

        const users = getUsers();

        const matchedUser = users.find(user =>
            user.email === email && user.password === password
        );

        if (!matchedUser) {
            message.textContent = "Incorrect email or password.";
            message.style.color = "red";
            return;
        }

        const currentUser = {
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email
        };

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

        message.textContent = "Login successful! Redirecting...";
        message.style.color = "green";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    });
}

// Logout
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = "login.html";
}

// Get currently logged-in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}


// Homepage account navigation
const accountControls = document.querySelector("#account-controls");

if (accountControls) {
    const currentUser = getCurrentUser();

    if (currentUser) {
        accountControls.innerHTML = `
            <span class="nav-link fw-semibold">
                <i class="bi bi-person-circle me-1"></i>
                ${currentUser.name}
            </span>

            <button class="btn home-track-button" id="logout-button" type="button">
                Log Out
            </button>
        `;

        document.querySelector("#logout-button").addEventListener("click", logout);

    } else {
        accountControls.innerHTML = `
            <a href="login.html" class="btn home-track-button">Log In</a>
            <a href="register.html" class="btn home-report-button">Register</a>
        `;
    }
}


function requireLogin() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}


