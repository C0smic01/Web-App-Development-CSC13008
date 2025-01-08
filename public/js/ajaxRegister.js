// Stretch the time between requests to the server to check if a username or email is available
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

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

// The submit button should be disabled if there are any validation errors
function updateSubmitButtonState() {
    const submitButton = document.querySelector('form[action="/auth/register"] button[type="submit"]');
    const hasErrors = document.querySelectorAll('.validation-message').length > 0;
    
    if (submitButton) {
        if (hasErrors) {
            submitButton.disabled = true;
            submitButton.style.backgroundColor = '#cccccc';
            submitButton.style.cursor = 'not-allowed';
        } else {
            submitButton.disabled = false;
            submitButton.style.backgroundColor = '';
            submitButton.style.cursor = 'pointer';
        }
    }
}

// Show validation message for input fields
function showValidationMessage(input, message, isError, field) {
    if (isError) {
        const messageDiv = document.createElement('div');
        if (field === 'username') {
            messageDiv.className = 'validation-message validation-message-username alert-error';
        }
        else if (field === 'email') {
            messageDiv.className = 'validation-message validation-message-email alert-error';
        }
        else if (field === 'password') {
            messageDiv.className = 'validation-message validation-message-password alert-error';
        }
        else if (field === 'confirm_password') {
            messageDiv.className = 'validation-message validation-message-confirm-password alert-error';
        }

        messageDiv.style.fontSize = '0.8rem';
        messageDiv.style.marginTop = '2px';
        messageDiv.textContent = message;
        
        input.parentElement.insertBefore(messageDiv, input.nextSibling);
        input.dataset.hasError = 'true';
    } else {
        input.dataset.hasError = 'false';
    }

    updateSubmitButtonState();
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form[action="/auth/register"]');
    const usernameInput = document.querySelector('input[name="user_name"]');
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirm_password"]');

    updateSubmitButtonState();

    const checkUsername = debounce(async (event) => {
        const username = event.target.value.trim();

        const existingMessage = usernameInput.parentElement.querySelector('.validation-message-username');
        if (existingMessage) {
            existingMessage.remove();
            updateSubmitButtonState();
        }

        if (!username) {
            showValidationMessage(usernameInput, 'Username is required', true, 'username');
            return;
        }

        if (username.length < 3) {
            showValidationMessage(usernameInput, 'Username must be at least 3 characters', true, 'username');
            return;
        }
        const result = await checkAvailability('user_name', username);
        if (!result.available) {
            showValidationMessage(usernameInput, 'Username not available', true, 'username');
        } else {
            showValidationMessage(usernameInput, '', false, 'username');
        }
    }, 500);

    const checkEmail = debounce(async (event) => {
        const email = event.target.value.trim();
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValidEmail = emailRegex.test(email);

        const existingMessage = emailInput.parentElement.querySelector('.validation-message-email');
        if (existingMessage) {
            existingMessage.remove();
            updateSubmitButtonState();
        }

        if (!email) {
            showValidationMessage(emailInput, 'Email address is required', true, 'email');
            return;
        }

        if (!isValidEmail) {
            showValidationMessage(emailInput, 'Please enter a valid email address', true, 'email');
            return;
        }

        const result = await checkAvailability('email', email);
        if (!result.available) {
            showValidationMessage(emailInput, 'Email already registered', true, 'email');
        } else {
            showValidationMessage(emailInput, '', false, 'email');
        }
    }, 500);

    const checkPassword = debounce((event) => {
        const password = event.target.value.trim();
    
        const existingMessage = passwordInput.parentElement.querySelector('.validation-message-password');
        if (existingMessage) {
            existingMessage.remove();
            updateSubmitButtonState();
        }
    
        if (!password) {
            showValidationMessage(passwordInput, 'Password is required', true, 'password');
            return;
        }
        
        if (password.length < 6) {
            showValidationMessage(passwordInput, 'Password must be at least 6 characters', true, 'password');
            return;
        }
    
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            showValidationMessage(passwordInput, 'Password must contain at least one uppercase letter, one lowercase letter and one number', true, 'password');
            return;
        }

        showValidationMessage(passwordInput, '', false, 'password');
        // Also check confirm password when password changes
        if (confirmPasswordInput.value) {
            checkConfirmPassword({ target: confirmPasswordInput });
        }
    }, 500);

    const checkConfirmPassword = debounce((event) => {
        const password = passwordInput.value.trim();
        const confirmPassword = event.target.value.trim();
    
        const existingMessage = confirmPasswordInput.parentElement.querySelector('.validation-message-confirm-password');
        if (existingMessage) {
            existingMessage.remove();
            updateSubmitButtonState();
        }
    
        if (password !== confirmPassword) {
            showValidationMessage(confirmPasswordInput, 'Passwords do not match', true, 'confirm_password');
        } else {
            showValidationMessage(confirmPasswordInput, '', false, 'confirm_password');
        }
    }, 500);

    // Form submission handler
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        document.querySelectorAll('.validation-message').forEach(msg => msg.remove());
        updateSubmitButtonState();

        // Validate all fields
        await checkUsername.apply(usernameInput, [{ target: usernameInput }]);
        await checkEmail.apply(emailInput, [{ target: emailInput }]);
        checkPassword.apply(passwordInput, [{ target: passwordInput }]);
        checkConfirmPassword.apply(confirmPasswordInput, [{ target: confirmPasswordInput }]);

        setTimeout(() => {
            const hasErrors = document.querySelectorAll('.validation-message').length > 0;

            if (!hasErrors) {
                form.submit();
            }
        }, 1000);
    });

    if (usernameInput) {
        usernameInput.addEventListener('input', checkUsername);
    }

    if (emailInput) {
        emailInput.addEventListener('input', checkEmail);
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', checkPassword);
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkConfirmPassword);
    }
});