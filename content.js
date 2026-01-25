// content.js
// Demo-only auth with localStorage: NOT secure for real passwords.

document.addEventListener('DOMContentLoaded', function () {
    const showSigninBtn = document.getElementById('show-signin');
    const showSignupBtn = document.getElementById('show-signup');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const authMessage = document.getElementById('auth-message');
    const authStatus = document.getElementById('auth-status');
    const logoutBtn = document.getElementById('logout-btn');

    const signinUsername = document.getElementById('signin-username');
    const signinPassword = document.getElementById('signin-password');
    const signinShowPass = document.getElementById('signin-show-pass');
    const signinRemember = document.getElementById('signin-remember');

    const signupUsername = document.getElementById('signup-username');
    const signupPassword = document.getElementById('signup-password');
    const signupConfirm = document.getElementById('signup-confirm');
    const signupShowPass = document.getElementById('signup-show-pass');
    const signupRemember = document.getElementById('signup-remember');

    const restrictedCards = document.querySelectorAll('.restricted');

    function isLoggedIn() {
        return !!localStorage.getItem('victories_current_user');
    }

    function setMessage(text, type) {
        authMessage.textContent = text;
        if (!text) {
            authMessage.style.color = '';
            return;
        }
        authMessage.style.color = type === 'error' ? '#ffb3b3' : '#c8ffb3';
    }

    function updateStatus() {
        const currentUser = localStorage.getItem('victories_current_user');
        if (currentUser) {
            authStatus.textContent = 'Logged in as ' + currentUser;
            logoutBtn.style.display = 'inline-block';
        } else {
            authStatus.textContent = 'Not logged in';
            logoutBtn.style.display = 'none';
        }
    }

    // Load remembered credentials for sign in
    function loadRemembered() {
        const savedUser = localStorage.getItem('victories_saved_user');
        const savedPass = localStorage.getItem('victories_saved_pass');
        if (savedUser) {
            signinUsername.value = savedUser;
            signinRemember.checked = true;
        }
        if (savedPass) {
            signinPassword.value = savedPass;
        }
    }

    // Toggle forms
    showSigninBtn.addEventListener('click', () => {
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
        showSigninBtn.classList.add('active');
        showSignupBtn.classList.remove('active');
        setMessage('', '');
    });

    showSignupBtn.addEventListener('click', () => {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
        showSignupBtn.classList.add('active');
        showSigninBtn.classList.remove('active');
        setMessage('', '');
    });

    // Toggle password visibility
    function bindShowPassword(checkbox, ...fields) {
        checkbox.addEventListener('change', () => {
            fields.forEach(field => {
                field.type = checkbox.checked ? 'text' : 'password';
            });
        });
    }

    bindShowPassword(signinShowPass, signinPassword);
    bindShowPassword(signupShowPass, signupPassword, signupConfirm);

    // Intercept clicks on restricted games
    restrictedCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!isLoggedIn()) {
                e.preventDefault();
                setMessage('Sign up or sign in first before you access this game.', 'error');
                // Switch to sign in tab to make it obvious
                signinForm.style.display = 'block';
                signupForm.style.display = 'none';
                showSigninBtn.classList.add('active');
                showSignupBtn.classList.remove('active');
            }
        });
    });

    // Sign Up
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = signupUsername.value.trim();
        const password = signupPassword.value;
        const confirm = signupConfirm.value;

        if (!username || !password) {
            setMessage('Please enter a username and password.', 'error');
            return;
        }
        if (password !== confirm) {
            setMessage('Passwords do not match.', 'error');
            return;
        }

        const usersRaw = localStorage.getItem('victories_users');
        const users = usersRaw ? JSON.parse(usersRaw) : {};

        if (users[username]) {
            setMessage('Username already exists, choose another.', 'error');
            return;
        }

        users[username] = password;
        localStorage.setItem('victories_users', JSON.stringify(users));
        localStorage.setItem('victories_current_user', username);

        // Remember credentials if checked
        if (signupRemember.checked) {
            localStorage.setItem('victories_saved_user', username);
            localStorage.setItem('victories_saved_pass', password);
        }

        setMessage('Account created and signed in! You can now open all games.', 'success');
        updateStatus();
        signupForm.reset();
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
        showSigninBtn.classList.add('active');
        showSignupBtn.classList.remove('active');
    });

    // Sign In
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = signinUsername.value.trim();
        const password = signinPassword.value;

        const usersRaw = localStorage.getItem('victories_users');
        const users = usersRaw ? JSON.parse(usersRaw) : {};

        if (!users[username] || users[username] !== password) {
            setMessage('Invalid username or password.', 'error');
            return;
        }

        localStorage.setItem('victories_current_user', username);

        if (signinRemember.checked) {
            localStorage.setItem('victories_saved_user', username);
            localStorage.setItem('victories_saved_pass', password);
        } else {
            localStorage.removeItem('victories_saved_user');
            localStorage.removeItem('victories_saved_pass');
        }

        setMessage('Signed in successfully! You can now open all games.', 'success');
        updateStatus();
    });

    // Log out
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('victories_current_user');
        setMessage('Logged out. Restricted games require sign in again.', 'success');
        updateStatus();
    });

    // Initial state
    loadRemembered();
    updateStatus();
});
