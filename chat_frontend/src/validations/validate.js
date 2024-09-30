export const validateEmail = (emailAddress) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(emailAddress)) {
        return false
    }
    return true
};

