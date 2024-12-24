const VALIDATION_RULES = {
    USERNAME: {
        MIN_LENGTH: 3,
        REQUIRED_MESSAGE: 'Username is required',
        LENGTH_MESSAGE: 'Username must be at least 3 characters',
        TAKEN_MESSAGE: 'Username not available'
    },
    EMAIL: {
        PATTERN: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        REQUIRED_MESSAGE: 'Email address is required',
        FORMAT_MESSAGE: 'Please enter a valid email address',
        TAKEN_MESSAGE: 'Email already registered'
    },
    PASSWORD: {
        MIN_LENGTH: 6,
        PATTERN: {
            UPPERCASE: /[A-Z]/,
            LOWERCASE: /[a-z]/,
            NUMBER: /[0-9]/
        },
        REQUIRED_MESSAGE: 'Password is required',
        LENGTH_MESSAGE: 'Password must be at least 6 characters',
        COMPLEXITY_MESSAGE: 'Password must contain at least one uppercase letter, one lowercase letter and one number',
        MATCH_MESSAGE: 'Passwords do not match'
    }
};

const validateUsername = (username) => {
    if (!username) {
        return { isValid: false, message: VALIDATION_RULES.USERNAME.REQUIRED_MESSAGE };
    }
    if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
        return { isValid: false, message: VALIDATION_RULES.USERNAME.LENGTH_MESSAGE };
    }
    return { isValid: true };
};

const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, message: VALIDATION_RULES.EMAIL.REQUIRED_MESSAGE };
    }
    if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
        return { isValid: false, message: VALIDATION_RULES.EMAIL.FORMAT_MESSAGE };
    }
    return { isValid: true };
};

const validatePassword = (password, confirmPassword = null) => {
    if (!password) {
        return { isValid: false, message: VALIDATION_RULES.PASSWORD.REQUIRED_MESSAGE };
    }
    if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
        return { isValid: false, message: VALIDATION_RULES.PASSWORD.LENGTH_MESSAGE };
    }
    if (!VALIDATION_RULES.PASSWORD.PATTERN.UPPERCASE.test(password) ||
        !VALIDATION_RULES.PASSWORD.PATTERN.LOWERCASE.test(password) ||
        !VALIDATION_RULES.PASSWORD.PATTERN.NUMBER.test(password)) {
        return { isValid: false, message: VALIDATION_RULES.PASSWORD.COMPLEXITY_MESSAGE };
    }
    if (confirmPassword !== null && password !== confirmPassword) {
        return { isValid: false, message: VALIDATION_RULES.PASSWORD.MATCH_MESSAGE };
    }
    return { isValid: true };
};

module.exports = {validateUsername,validateEmail,validatePassword}