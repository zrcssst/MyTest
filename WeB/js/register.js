// WeB/js/register.js

import { register } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessageElement = document.getElementById('error-message-register');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const data = await register({ name, email, password });
                alert(data.message); // Tampilkan pesan sukses dari server
                window.location.href = 'login.html'; // Arahkan ke halaman login
            } catch (error) {
                errorMessageElement.textContent = error.message;
            }
        });
    }
});