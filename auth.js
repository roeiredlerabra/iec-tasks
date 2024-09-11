function login(email, password) {
    return fetch('https://prod-127.westeurope.logic.azure.com:443/workflows/c9fe1de68a0148e2b007abf488c3a43d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cW9L_qcacT9itVeyZZgTnjnJBtYTS3LZjcFT_MCrjWg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            localStorage.setItem('permissions', JSON.stringify(data.user.permissions));
            return data;
        } else {
            throw new Error(data.message || 'Login failed');
        }
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    document.getElementById('mainContentContainer').classList.add('hidden');
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('loginContainer').classList.remove('fade-out');
    document.getElementById('loginContainer').classList.add('fade-in');
}

function checkPermission(permission) {
    const permissions = JSON.parse(localStorage.getItem('permissions'));
    return permissions && permissions[permission] === "true";
}

function showLoginForm() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('mainContentContainer').classList.add('hidden');
}

function hideLoginForm() {
    document.getElementById('loginContainer').classList.add('fade-out');
    setTimeout(() => {
        document.getElementById('loginContainer').style.display = 'none';
        showMainContent();
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showNotification('נא למלא את כל השדות', 'error');
                shakeForm();
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('אנא הזן כתובת אימייל תקינה', 'error');
                shakeForm();
                return;
            }

            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> מתחבר...';

            login(email, password)
                .then(data => {
                    showNotification('התחברת בהצלחה', 'success');
                    hideLoginForm();
                    initializeApp();
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification(error.message || 'שגיאה בהתחברות', 'error');
                    shakeForm();
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'התחבר';
                });
        });
    }
});

function isValidEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

function shakeForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
    }
}

function checkExistingLogin() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainContentContainer').classList.remove('hidden');
        initializeApp();
    }
}

document.addEventListener('DOMContentLoaded', checkExistingLogin);
document.getElementById('logoutButton').addEventListener('click', logout);