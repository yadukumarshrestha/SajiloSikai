document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const formContainers = document.querySelectorAll('.form-container');
    const toggleDarkMode = document.getElementById('toggle-dark-mode');

    // Modal Elements
    const registerModal = document.getElementById('register-modal');
    const forgotUserModal = document.getElementById('forgot-user-modal');
    const forgotAdminModal = document.getElementById('forgot-admin-modal');

    // Open Modal Buttons
    const openRegisterBtn = document.getElementById('open-register');
    const openForgotUserBtn = document.getElementById('open-forgot-user');
    const openForgotAdminBtn = document.getElementById('open-forgot-admin');

    // Close Modal Buttons
    const closeRegisterBtn = document.getElementById('close-register');
    const closeForgotUserBtn = document.getElementById('close-forgot-user');
    const closeForgotAdminBtn = document.getElementById('close-forgot-admin');

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            formContainers.forEach(fc => fc.classList.remove('active'));
            const selectedForm = document.getElementById(tab.dataset.tab);
            selectedForm.classList.add('active');
        });
    });

    // Open Modals
    openRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'block';
    });

    openForgotUserBtn.addEventListener('click', (e) => {
        e.preventDefault();
        forgotUserModal.style.display = 'block';
    });

    openForgotAdminBtn.addEventListener('click', (e) => {
        e.preventDefault();
        forgotAdminModal.style.display = 'block';
    });

    // Close Modals
    closeRegisterBtn.addEventListener('click', () => registerModal.style.display = 'none');
    closeForgotUserBtn.addEventListener('click', () => forgotUserModal.style.display = 'none');
    closeForgotAdminBtn.addEventListener('click', () => forgotAdminModal.style.display = 'none');

    // Dark Mode Toggle
    toggleDarkMode.addEventListener('change', () => document.body.classList.toggle('dark-mode'));

    // Registration Logic
    document.getElementById('registration-form').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        const name = document.getElementById('register-name').value;
        const username = document.getElementById('register-username').value;
        const phoneNumber = document.getElementById('register-phone').value;
        const gender = document.getElementById('register-gender').value;
        const password = document.getElementById('register-password').value;

        if (isUsernameTaken(username)) {
            alert('Username already taken. Please choose another one.');
            return;
        }

        registerUser(name, username, phoneNumber, gender, password);
        alert('Registration successful! Please log in.');
        registerModal.style.display = 'none'; // Close modal
    });

    // Check if username already exists
    function isUsernameTaken(username) {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        return users.some(user => user.username === username);
    }

    // Register user function
    function registerUser(name, username, phoneNumber, gender, password) {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const newUser = { name, username, phoneNumber, gender, password };
        users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        renderUsers(users); // Update the user list
    }

    // Login Logic
    const adminLoginForm = document.querySelector('form[action="../admin panel/admin-panel.html"]');
    const userLoginForm = document.querySelector('form[action="../user panel/userPanel.html"]');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    if (userLoginForm) {
        userLoginForm.addEventListener('submit', handleUserLogin);
    }

    function handleAdminLogin(event) {
        event.preventDefault();
        const adminId = adminLoginForm.querySelector('input[name="admin_id"]').value;
        const adminPassword = adminLoginForm.querySelector('input[name="password"]').value;

        const validAdminId = 'admin123'; // Replace with your actual admin ID
        const validAdminPassword = 'password123'; // Replace with your actual admin password
        let adminLoginAttempts = 0;

        if (adminId === validAdminId && adminPassword === validAdminPassword) {
            alert('Admin logged in! Redirecting to admin panel...');
            window.location.href = '../admin panel/admin-panel.html'; // Redirect to the admin panel
        } else {
            adminLoginAttempts++;
            alert('Incorrect admin ID or password. Please try again.');
            if (adminLoginAttempts >= 3) {
                alert('Too many failed attempts. Please try again later.');
                adminLoginForm.querySelector('button[type="submit"]').disabled = true;
                setTimeout(() => adminLoginForm.querySelector('button[type="submit"]').disabled = false, 30000);
            }
        }
    }

    function handleUserLogin(event) {
        event.preventDefault();
        const username = userLoginForm.querySelector('input[name="username"]').value;
        const password = userLoginForm.querySelector('input[name="password"]').value;

        if (authenticateUser(username, password)) {
            alert('User logged in! Redirecting to user panel...');
            window.location.href = '../user panel/userPanel.html'; // Redirect to the user panel
        } else {
            alert('Invalid username or password. Please try again.');
        }
    }

    function authenticateUser(username, password) {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        return users.some(user => user.username === username && user.password === password);
    }
    
    // Rendering Users
    const userList = document.getElementById('userList').querySelector('tbody');

    function renderUsers(users) {
        userList.innerHTML = ''; // Clear existing rows
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${user.name}</td><td>${user.username}</td><td>${user.phoneNumber}</td><td>${user.gender}</td>`;
            userList.appendChild(row);
        });
    }

    // Initial Rendering of Users
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    renderUsers(existingUsers);

    // Forgot Password Logic
    document.getElementById('forgot-password-form').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById('forgot-username').value;
        const phoneNumber = document.getElementById('forgot-phone').value;
        const newPassword = document.getElementById('new-password').value;

        // Validate credentials and reset password
        if (resetPassword(username, phoneNumber, newPassword)) {
            alert('Password has been reset successfully! You can now log in with your new password.');
            document.getElementById('forgot-user-modal').style.display = 'none'; // Close modal
        } else {
            alert('Username and phone number do not match. Please try again.');
        }
    });

    // Reset Password Function
    function resetPassword(username, phoneNumber, newPassword) {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const user = users.find(user => user.username === username && user.phoneNumber === phoneNumber);

        if (user) {
            user.password = newPassword; // Update password
            localStorage.setItem('registeredUsers', JSON.stringify(users)); // Save updated users
            return true;
        }

        return false; // Username and phone number did not match
    }

    // User Adding Logic (For Admin Panel)
    document.getElementById('add-user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addUser();
    });

    function addUser() {
        const name = document.getElementById('new-user-name').value;
        const username = document.getElementById('new-username').value;
        const phone = document.getElementById('new-user-phone').value;
        const gender = document.getElementById('new-user-gender').value;
        const password = document.getElementById('new-user-password').value;

        const user = {
            name: name,
            username: username,
            phone: phone,
            gender: gender,
            password: password
        };

        // Get existing users from localStorage
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        users.push(user);
        localStorage.setItem('registeredUsers', JSON.stringify(users)); // Save to registeredUsers

        // Clear input fields after adding
        document.getElementById('add-user-form').reset();
        
        // Refresh the user list
        renderUsers(users);
    }
});
