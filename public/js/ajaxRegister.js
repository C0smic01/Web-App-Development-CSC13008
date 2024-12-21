// Stretch the time between requests to the server to check if a username or email is available
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Check field availability
async function checkAvailability(field, value) {
    try {
        const response = await fetch(`/auth/check-availability?field=${field}&value=${value}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error checking ${field} availability:`, error);
        return { available: false, message: 'Error checking availability' };
    }
}

// Show error message
function showValidationMessage(input, message, isError) {
    if (isError) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'validation-message alert-error';
        messageDiv.style.fontSize = '0.8rem';
        messageDiv.style.marginTop = '2px';
        messageDiv.textContent = message;
        
        input.parentElement.insertBefore(messageDiv, input.nextSibling);
    }
}

// Initialize availability checking
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.querySelector('input[name="user_name"]');
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');

    const checkUsername = debounce(async (event) => {
        const username = event.target.value.trim();
        if (username.length < 3) {
            showValidationMessage(usernameInput, 'Username must be at least 3 characters', true);
            return;
        }
        const result = await checkAvailability('user_name', username);
        if (!result.available) {
            showValidationMessage(
                usernameInput,
                "Username not available",
                true
            );
        } 
        else {
            // Remove any existing error message if the username is available
            const existingMessage = usernameInput.parentElement.querySelector('.validation-message');
            if (existingMessage) {
                existingMessage.remove();
            }
        }
    }, 500);

    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    const checkEmail = debounce(async (event) => {
        const email = event.target.value.trim();
        if (!email || !isValidEmail(email)) 
        {
            showValidationMessage(emailInput, 'Please enter a valid email address', true);
            return;
        }

        const result = await checkAvailability('email', email);
        if (!result.available) 
        {
            showValidationMessage(
                emailInput,
                "Email already registered",
                true
            );
        } 
        else {
            const existingMessage = emailInput.parentElement.querySelector('.validation-message');
            if (existingMessage) {
                existingMessage.remove();
            }
        }
    }, 500);

    const checkPassword = debounce((event) => {}, 500);

    if (usernameInput) {
        usernameInput.addEventListener('input', checkUsername);
    }

    if (emailInput) {
        emailInput.addEventListener('input', checkEmail);
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', checkPassword);
    }
});