// content.js
// Demo-only auth with localStorage: NOT secure for real passwords.

document.addEventListener('DOMContentLoaded', function () {
    // Buttons / forms / UI
    const showSigninBtn = document.getElementById('show-signin');
    const showSignupBtn = document.getElementById('show-signup');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const authMessage = document.getElementById('auth-message');
    const authStatus = document.getElementById('auth-status');
    const logoutBtn = document.getElementById('logout-btn');

    // Signin inputs
    const signinUsername = document.getElementById('signin-username');
    const signinPassword = document.getElementById('signin-password');
    const signinShowPass = document.getElementById('signin-show-pass');
    const signinRemember = document.getElementById('signin-remember');

    // Signup inputs
    const signupUsername = document.getElementById('signup-username');
    const signupPassword = document.getElementById('signup-password');
    const signupConfirm = document.getElementById('signup-confirm');
    const signupShowPass = document.getElementById('signup-show-pass');
    const signupRemember = document.getElementById('signup-remember');

    const signinSubmit = document.getElementById('signin-submit');
    const signupSubmit = document.getElementById('signup-submit');

    // Helper keys in localStorage
    const USERS_KEY = 'victories_users';
    const CURRENT_KEY = 'victories_current_user';
    const SAVED_CREDS = 'victories_saved_creds'; // for "remember" demo only

    // Utility - load users object
    function loadUsers() {
        try {
            const raw = localStorage.getItem(USERS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    // Utility - save users object
    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Utility - set current user
    function setCurrentUser(username) {
        if (username) {
            localStorage.setItem(CURRENT_KEY, username);
        } else {
            localStorage.removeItem(CURRENT_KEY);
        }
        updateAuthUI();
    }

    // Utility - get current user
    function getCurrentUser() {
        return localStorage.getItem(CURRENT_KEY);
    }

    // Update UI depending on auth state
    function updateAuthUI() {
        const user = getCurrentUser();
        if (user) {
            authStatus.textContent = `Signed in as: ${user}`;
            logoutBtn.style.display = 'inline-block';
            authMessage.textContent = '';
            // allow restricted links (we handle clicks separately)
        } else {
            authStatus.textContent = 'Not signed in';
            logoutBtn.style.display = 'none';
        }
    }

    // Show message helper
    function showMessage(msg, isError = true) {
        authMessage.textContent = msg;
        authMessage.style.color = isError ? '#ffb3b3' : '#b7ffb3';
    }

    // Toggle show/hide forms
    function showSignin() {
        showSigninBtn.classList.add('active');
        showSignupBtn.classList.remove('active');
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
        authMessage.textContent = '';
    }

    function showSignup() {
        showSignupBtn.classList.add('active');
        showSigninBtn.classList.remove('active');
        signupForm.style.display = 'block';
        signinForm.style.display = 'none';
        authMessage.textContent = '';
    }

    // Wire toggle buttons
    showSigninBtn.addEventListener('click', showSignin);
    showSignupBtn.addEventListener('click', showSignup);

    // Show password toggles
    signinShowPass.addEventListener('change', () => {
        signinPassword.type = signinShowPass.checked ? 'text' : 'password';
    });
    signupShowPass.addEventListener('change', () => {
        signupPassword.type = signupShowPass.checked ? 'text' : 'password';
        signupConfirm.type = signupShowPass.checked ? 'text' : 'password';
    });

    // Remember feature (demo): fill sign in fields if saved
    (function loadSavedCreds() {
        try {
            const raw = localStorage.getItem(SAVED_CREDS);
            if (raw) {
                const cred = JSON.parse(raw);
                if (cred && cred.username && cred.password) {
                    signinUsername.value = cred.username;
                    signinPassword.value = cred.password;
                    signinRemember.checked = true;
                }
            }
        } catch (e) {
            // ignore
        }
    })();

    // Signup handler
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = signupUsername.value.trim();
        const password = signupPassword.value;
        const confirm = signupConfirm.value;

        if (!username || !password) {
            showMessage('Please enter a username and password.');
            return;
        }
        if (password !== confirm) {
            showMessage('Passwords do not match.');
            return;
        }

        const users = loadUsers();
        if (users[username]) {
            showMessage('Username already exists. Choose another.');
            return;
        }

        // Save user (demo: plaintext)
        users[username] = {
            password: password
        };
        saveUsers(users);

        // Auto sign-in after signup
        setCurrentUser(username);

        // Save credentials if requested (demo)
        if (signupRemember.checked) {
            localStorage.setItem(SAVED_CREDS, JSON.stringify({ username, password }));
        }

        showMessage('Signup successful — signed in!', false);
        // switch to signin view to match previous UI if desired:
        showSignin();
    });

    // Signin handler
    signinForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = signinUsername.value.trim();
        const password = signinPassword.value;

        if (!username || !password) {
            showMessage('Enter username and password.');
            return;
        }

        const users = loadUsers();
        const record = users[username];
        if (!record || record.password !== password) {
            showMessage('Invalid username or password.');
            return;
        }

        setCurrentUser(username);

        // Save credentials if requested (demo)
        if (signinRemember.checked) {
            localStorage.setItem(SAVED_CREDS, JSON.stringify({ username, password }));
        } else {
            localStorage.removeItem(SAVED_CREDS);
        }

        showMessage('Signed in successfully!', false);
    });

    // Logout
    logoutBtn.addEventListener('click', function () {
        setCurrentUser(null);
        showMessage('Logged out.', false);
    });

    // Prevent navigation to restricted games if not signed in
    function initRestrictedGuards() {
        const restrictedLinks = document.querySelectorAll('a.restricted');
        restrictedLinks.forEach(link => {
            link.addEventListener('click', (ev) => {
                const user = getCurrentUser();
                if (!user) {
                    ev.preventDefault();
                    showMessage('You must sign in to open restricted games.');
                    // small visual hint
                    link.classList.add('blocked');
                    setTimeout(() => link.classList.remove('blocked'), 800);
                }
                // if user is signed in — allow navigation
            }, false);
        });
    }

    // initial setup
    updateAuthUI();
    initRestrictedGuards();

    // Safety: if there is already a "current user" in localStorage, keep them signed in
    // done in updateAuthUI()

});
