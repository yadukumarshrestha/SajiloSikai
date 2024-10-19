document.addEventListener("DOMContentLoaded", () => {
    // Element references
    const logoutButton = document.getElementById("logout-btn");
    const editProfileButton = document.getElementById("edit-profile-btn");
    const usernameDisplay = document.getElementById("username-display");
    const profileName = document.getElementById("profile-name");
    const profilePhone = document.getElementById("profile-phone");
    const categoryButtons = document.querySelectorAll(".category-btn");
    const quizSection = document.getElementById("quiz-section");
    const questionsContainer = document.getElementById("questions-container");
    const submitQuizButton = document.getElementById("submit-quiz-btn");
    const scoreSection = document.getElementById("score-section");
    const scoreElement = document.getElementById("score");
    const viewScoreButton = document.getElementById("view-score-btn");
    const scoreHistory = document.getElementById("score-history");
    const scoreHistoryBody = document.getElementById("score-history-body");
    const clearScoreHistoryButton = document.getElementById("clear-score-history-btn");

    // Load user data from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
    usernameDisplay.textContent = currentUser.username || "Guest";
    profileName.textContent = currentUser.name || "John Doe";
    profilePhone.textContent = currentUser.phone || "123-456-7890";

    // Logout functionality
    logoutButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("currentUser");
            window.location.href = "../user login pages/index.html"; // Adjust this path as needed
        }
    });

    // Validate phone number format
    function isValidPhoneNumber(phone) {
        const phonePattern = /^\d{3}-\d{3}-\d{4}$/; // Format: XXX-XXX-XXXX
        return phonePattern.test(phone);
    }

    // Edit Profile functionality
    editProfileButton.addEventListener("click", () => {
        const newName = prompt("Enter your name:", profileName.textContent);
        const newPhone = prompt("Enter your phone number:", profilePhone.textContent);

        if (newName) {
            profileName.textContent = newName;
            currentUser.name = newName;
        }
        if (newPhone) {
            if (isValidPhoneNumber(newPhone)) {
                profilePhone.textContent = newPhone;
                currentUser.phone = newPhone;
            } else {
                alert("Please enter a valid phone number in the format XXX-XXX-XXXX.");
            }
        }

        localStorage.setItem("currentUser", JSON.stringify(currentUser)); // Save updated user info
        alert("Profile updated successfully!");
    });

    // Handle category selection
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const category = button.getAttribute("data-category");
            loadQuestions(category);
        });
    });

    // Shuffle an array (Fisher-Yates Shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    // Load questions based on selected category
    function loadQuestions(category) {
        const questions = JSON.parse(localStorage.getItem("questions")) || [];
        const filteredQuestions = questions.filter(q => q.category === category);
        questionsContainer.innerHTML = ''; // Clear previous questions

        if (filteredQuestions.length === 0) {
            alert(`No questions available for the category "${category}".`);
            return;
        }

        // Shuffle and limit questions to 5
        const shuffledQuestions = shuffleArray(filteredQuestions).slice(0, 5);
        displayQuestions(shuffledQuestions); // Call to display the questions
        quizSection.setAttribute("aria-hidden", "false"); // Show quiz section
    }

    // Display questions in the quiz section
    function displayQuestions(questions) {
        questions.forEach((question, index) => {
            const questionCard = document.createElement("div");
            questionCard.className = "question-card";
            questionCard.innerHTML = `
                <p>${index + 1}. ${question.question}</p>
                <label><input type="radio" name="question-${index}" value="A"> A: ${question.options.A}</label><br>
                <label><input type="radio" name="question-${index}" value="B"> B: ${question.options.B}</label><br>
                <label><input type="radio" name="question-${index}" value="C"> C: ${question.options.C}</label><br>
                <label><input type="radio" name="question-${index}" value="D"> D: ${question.options.D}</label><br>
            `;
            questionsContainer.appendChild(questionCard);
        });
    }

    // Update the progress bar
    function updateProgressBar(currentQuestionIndex, totalQuestions) {
        const progressBar = document.getElementById("progress-bar");
        const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute("aria-valuenow", progressPercentage); // Update ARIA attribute
    }

    // Submit the quiz and calculate the score
    submitQuizButton.addEventListener("click", () => {
        const questions = JSON.parse(localStorage.getItem("questions")) || [];
        let score = 0;

        questions.forEach((question, index) => {
            const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
            if (selectedOption && selectedOption.value === question.correct) {
                score++;
            }
            updateProgressBar(index, questions.length); // Update progress bar
        });

        scoreElement.textContent = `You scored ${score} out of ${questions.length}`;
        scoreSection.setAttribute("aria-hidden", "false"); // Show score section
        saveScoreHistory(score); // Save score history
    });

    // Save score history to localStorage
    function saveScoreHistory(score) {
        const scoreHistoryList = JSON.parse(localStorage.getItem("scoreHistory")) || [];
        const now = new Date().toLocaleString();
        scoreHistoryList.push({ date: now, score: score });
        localStorage.setItem("scoreHistory", JSON.stringify(scoreHistoryList));
    }

    // View and display score history
    viewScoreButton.addEventListener("click", () => {
        scoreHistory.setAttribute("aria-hidden", "false");
        displayScoreHistory(); // Call to display the score history
    });

    // Display score history in the table
    function displayScoreHistory() {
        scoreHistoryBody.innerHTML = ''; // Clear previous entries
        const scoreHistoryList = JSON.parse(localStorage.getItem("scoreHistory")) || [];
        scoreHistoryList.forEach(entry => {
            const row = scoreHistoryBody.insertRow();
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.score}</td>
            `;
        });
    }

    // Clear score history
    clearScoreHistoryButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your score history?")) {
            localStorage.removeItem("scoreHistory");
            scoreHistoryBody.innerHTML = ''; // Clear displayed history
            alert("Score history cleared.");
        }
    });
});
