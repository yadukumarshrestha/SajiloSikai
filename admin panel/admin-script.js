document.addEventListener("DOMContentLoaded", () => {
    const addQuestionForm = document.getElementById("add-question-form");
    const addUserForm = document.getElementById("add-user-form");
    const userSearch = document.getElementById("user-search");
    const userListContainer = document.getElementById("users-table").querySelector("tbody");
    const questionsTableBody = document.getElementById("questions-table").querySelector("tbody");
    const logoutButton = document.getElementById("logout-btn");

    let currentEditIndex = null; // For editing questions
    let currentUserEditIndex = null; // For editing users

    // Show/hide sections based on user selection
    document.getElementById("show-add-question").addEventListener("click", () => toggleSection("add-question-section"));
    document.getElementById("show-manage-users").addEventListener("click", () => toggleSection("manage-users-section"));
    document.getElementById("show-manage-questions").addEventListener("click", () => toggleSection("manage-questions-section"));

    // Add or Edit Question
    addQuestionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newQuestion = getQuestionFormData();
        const questions = JSON.parse(localStorage.getItem("questions")) || [];

        if (currentEditIndex !== null) {
            questions[currentEditIndex] = newQuestion; // Update existing question
            showToast("Question updated successfully!");
        } else {
            questions.push(newQuestion); // Add new question
            showToast("Question added successfully!");
        }

        localStorage.setItem("questions", JSON.stringify(questions));
        addQuestionForm.reset();
        displayQuestions();
        currentEditIndex = null; // Reset edit index after submission
        toggleSection("manage-questions-section"); // Go back to manage questions section
    });

    // Add User
    addUserForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newUser = getUserFormData();
        const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];

        if (currentUserEditIndex !== null) {
            users[currentUserEditIndex] = newUser; // Update existing user
            showToast("User updated successfully!");
        } else {
            users.push(newUser); // Add new user
            showToast("User added successfully!");
        }

        localStorage.setItem("registeredUsers", JSON.stringify(users)); // Update user storage
        addUserForm.reset();
        displayUsers();
        currentUserEditIndex = null; // Reset edit index after submission
        toggleSection("manage-users-section"); // Go back to manage users section
    });

    // Display Users
    function displayUsers() {
        userListContainer.innerHTML = ''; // Clear existing users
        const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
        users.forEach((user, index) => {
            const row = userListContainer.insertRow();
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${user.phone}</td>
                <td>${user.gender}</td>
                <td>${user.password}</td>
                <td>
                    <button class="edit-user" data-index="${index}">Edit</button>
                    <button class="delete-user" data-index="${index}">Delete</button>
                </td>
            `;
        });
        addEditDeleteUserEventListeners();
    }

    // Display Questions
    function displayQuestions() {
        questionsTableBody.innerHTML = ''; // Clear existing questions
        const questions = JSON.parse(localStorage.getItem("questions")) || [];
        questions.forEach((question, index) => {
            const options = Object.entries(question.options).map(([key, value]) => `${key}: ${value}`).join(', ');
            const row = questionsTableBody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${question.question}</td>
                <td>${options}</td>
                <td>${question.correct}</td>
                <td>
                    <button class="edit-question" data-index="${index}">Edit</button>
                    <button class="delete-question" data-index="${index}">Delete</button>
                </td>
            `;
        });
        addEditDeleteQuestionEventListeners();
    }

    // Get Question Form Data
    function getQuestionFormData() {
        return {
            category: document.getElementById("question-category").value,
            question: document.getElementById("question").value,
            options: {
                A: document.getElementById("optionA").value,
                B: document.getElementById("optionB").value,
                C: document.getElementById("optionC").value,
                D: document.getElementById("optionD").value,
            },
            correct: document.getElementById("correct-option").value,
        };
    }

    // Get User Form Data
    function getUserFormData() {
        return {
            name: document.getElementById("new-user-name").value,
            username: document.getElementById("new-username").value,
            phone: document.getElementById("new-user-phone").value,
            gender: document.getElementById("new-user-gender").value,
            password: document.getElementById("new-user-password").value,
        };
    }

    // Edit Question
    function editQuestion(index) {
        const questions = JSON.parse(localStorage.getItem("questions")) || [];
        const questionToEdit = questions[index];

        // Populate form with existing question data
        document.getElementById("question-category").value = questionToEdit.category;
        document.getElementById("question").value = questionToEdit.question;
        document.getElementById("optionA").value = questionToEdit.options.A;
        document.getElementById("optionB").value = questionToEdit.options.B;
        document.getElementById("optionC").value = questionToEdit.options.C;
        document.getElementById("optionD").value = questionToEdit.options.D;
        document.getElementById("correct-option").value = questionToEdit.correct;

        currentEditIndex = index; // Set current edit index
        toggleSection("add-question-section"); // Show add question section
    }

    // Edit User
    function editUser(index) {
        const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
        const userToEdit = users[index];

        // Populate form with existing user data
        document.getElementById("new-user-name").value = userToEdit.name;
        document.getElementById("new-username").value = userToEdit.username;
        document.getElementById("new-user-phone").value = userToEdit.phone;
        document.getElementById("new-user-gender").value = userToEdit.gender;
        document.getElementById("new-user-password").value = userToEdit.password;

        currentUserEditIndex = index; // Set current edit index
        toggleSection("add-user-section"); // Show add user section
    }

    // Delete User
    function deleteUser(index) {
        if (confirm("Are you sure you want to delete this user?")) {
            const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
            users.splice(index, 1); // Remove user at index
            localStorage.setItem("registeredUsers", JSON.stringify(users)); // Update user storage
            displayUsers(); // Refresh display
            showToast("User deleted successfully!");
        }
    }

    // Delete Question
    function deleteQuestion(index) {
        if (confirm("Are you sure you want to delete this question?")) {
            const questions = JSON.parse(localStorage.getItem("questions")) || [];
            questions.splice(index, 1); // Remove question at index
            localStorage.setItem("questions", JSON.stringify(questions));
            displayQuestions(); // Refresh display
            showToast("Question deleted successfully!");
        }
    }

    // Toggle Sections
    function toggleSection(sectionId) {
        const sections = document.querySelectorAll(".form-section");
        sections.forEach(section => {
            section.setAttribute("aria-hidden", "true");
            section.style.display = "none";
        });
        document.getElementById(sectionId).setAttribute("aria-hidden", "false");
        document.getElementById(sectionId).style.display = "block";
    }

    // Search Users
    userSearch.addEventListener("input", () => {
        const searchValue = userSearch.value.toLowerCase();
        const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];
        userListContainer.innerHTML = '';
        users.filter(user => user.name.toLowerCase().includes(searchValue)).forEach((user, index) => {
            const row = userListContainer.insertRow();
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${user.phone}</td>
                <td>${user.gender}</td>
                <td>${user.password}</td>
                <td>
                    <button class="edit-user" data-index="${index}">Edit</button>
                    <button class="delete-user" data-index="${index}">Delete</button>
                </td>
            `;
        });
        addEditDeleteUserEventListeners(); // Add delete event listeners for filtered users
    });

    // Show Toast Messages
    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000); // Show for 3 seconds
    }

    // Logout Functionality with Confirmation
    logoutButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to log out?")) {
            // Clear user session data
            localStorage.removeItem("currentUser"); // Adjust based on how you store the current user

            // Redirect to the specified login page
            window.location.href = "../user login pages/index.html"; // Redirect to your login page
        }
    });

    // Add event listeners for delete user buttons
    function addDeleteUserEventListeners() {
        document.querySelectorAll('.delete-user').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                deleteUser(index);
            });
        });
    }

    // Add event listeners for edit and delete user buttons
    function addEditDeleteUserEventListeners() {
        document.querySelectorAll('.edit-user').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                editUser(index);
            });
        });

        addDeleteUserEventListeners(); // Ensure delete listeners are added as well
    }

    // Add event listeners for edit and delete question buttons
    function addEditDeleteQuestionEventListeners() {
        document.querySelectorAll('.edit-question').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                editQuestion(index);
            });
        });

        document.querySelectorAll('.delete-question').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                deleteQuestion(index);
            });
        });
    }

    // Initial Display
    displayUsers();
    displayQuestions();
});
