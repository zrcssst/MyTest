// WeB/js/login.js (Versi BARU)

import { login } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Arahkan jika sudah login (sekarang cek localStorage)
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
    }

    const loginForm = document.getElementById('login-form');
    const errorMessageElement = document.getElementById('error-message-login');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            errorMessageElement.textContent = '';
            
            // Ambil email dan password, bukan lagi username
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Panggil fungsi login API yang baru
                await login({ email, password });
                window.location.href = 'index.html';
            } catch (error) {
                errorMessageElement.textContent = error.message;
            }
        });
    }

    // Tambahkan link ke halaman registrasi
    const formContainer = document.querySelector('.form-container');
    const registerLink = document.createElement('p');
    registerLink.style.textAlign = 'center';
    registerLink.style.marginTop = '1rem';
    registerLink.innerHTML = `Belum punya akun? <a href="register.html">Daftar di sini</a>`;
    formContainer.appendChild(registerLink);
});