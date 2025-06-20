// js/validation.js

function validateField(inputElement, errorElementId, errorMessage) {
    const errorElement = document.getElementById(errorElementId);
    if (inputElement.checkValidity()) {
        errorElement.textContent = '';
        inputElement.style.borderColor = 'var(--border-color)';
        return true;
    } else {
        errorElement.textContent = errorMessage || inputElement.validationMessage;
        inputElement.style.borderColor = 'var(--accent-color)';
        inputElement.focus();
        return false;
    }
}