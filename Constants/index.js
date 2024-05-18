exports.CONSTANTS = {
    DB_DIALECT: 'mysql',
    BEARER: 'Bearer'
};

exports.ERRORS = {
    INVALID_AUTH_TOKEN: 'The user belonging to this token does no longer exist',
    NOT_LOGGED_IN: 'You are Not logged In! Please log in to get access',
    INCORRECT_EMAIL_PASSWORD: 'Incorrect email or password',
    APTO_EMAIL_ALREADY_PRESENT: 'Email already in use!',
    STUDENT_NOT_FOUND: 'Student not found with the given email!',
    APTO_INVALID_OTP: 'Invalid otp!',
    INVALID_APTO_LOGIN: 'Invalid login details!'
};