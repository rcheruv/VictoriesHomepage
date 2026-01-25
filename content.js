// content.js
// Simple localStorage-based auth (NOT secure, demo only)

document.addEventListener('DOMContentLoaded', function () {
    const showSigninBtn = document.getElementById('show-signin');
    const showSignupBtn = document.getElementById('show-signup');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const authMessage = document.getElementById('auth-message');
    const authStatus = document.getElementById('auth-status');
    const logoutBtn = document.getElementById('logout-btn');

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

    // Toggle forms
    showSigninBtn.addEventListener('click', () => {
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
        setMessage('', '');
    });

    showSignupBtn.addEventListener('click', () => {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
        setMessage('', '');
    });

    // Sign Up handler
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

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

        setMessage('Account created and signed in!', 'success');
        updateStatus();
        signupForm.reset();
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
    });

    // Sign In handler
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signin-username').value.trim();
        const password = document.getElementById('signin-password').value;

        const usersRaw = localStorage.getItem('victories_users');
        const users = usersRaw ? JSON.parse(usersRaw) : {};

        if (!users[username] || users[username] !== password) {
            setMessage('Invalid username or password.', 'error');
            return;
        }

        localStorage.setItem('victories_current_user', username);
        setMessage('Signed in successfully!', 'success');
        updateStatus();
        signinForm.reset();
    });

    // Log out
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('victories_current_user');
        setMessage('Logged out.', 'success');
        updateStatus();
    });

    // Initial status
    updateStatus();
});
