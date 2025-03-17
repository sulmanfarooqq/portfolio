document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmail = document.getElementById('userEmail');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const closeBtns = document.getElementsByClassName('close');

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        showLoggedInState(localStorage.getItem('userEmail'));
    }

    // Event Listeners
    loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
    registerBtn.addEventListener('click', () => registerModal.style.display = 'block');
    logoutBtn.addEventListener('click', handleLogout);

    // Close modals when clicking (x)
    Array.from(closeBtns).forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            clearErrors();
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
            clearErrors();
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
            clearErrors();
        }
    });

    // Handle form submissions
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearErrors();
        
        const email = this.email.value;
        const password = this.password.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', data.email);
                showLoggedInState(data.email);
                loginModal.style.display = 'none';
                this.reset();
            } else {
                showError('loginError', data.error);
            }
        } catch (err) {
            showError('loginError', 'Error logging in. Please try again.');
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearErrors();
        
        const email = this.email.value;
        const password = this.password.value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', data.email);
                showLoggedInState(data.email);
                registerModal.style.display = 'none';
                this.reset();
            } else {
                showError('registerError', data.error);
            }
        } catch (err) {
            showError('registerError', 'Error registering. Please try again.');
        }
    });

    function showLoggedInState(email) {
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        userEmail.textContent = email;
        userEmail.classList.remove('hidden');
    }

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        userEmail.classList.add('hidden');
        userEmail.textContent = '';
    }

    function showError(elementId, message) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    function clearErrors() {
        const errorDivs = document.querySelectorAll('.error-message');
        errorDivs.forEach(div => {
            div.textContent = '';
            div.style.display = 'none';
        });
    }
}); 