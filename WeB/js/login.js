// WeB/js/login.js (Versi dengan notifikasi sesi berakhir)
import { login } from './api.js'; //

document.addEventListener('DOMContentLoaded', () => { //
    if (localStorage.getItem('token')) { //
        window.location.href = 'index.html'; //
    }

    const loginForm = document.getElementById('login-form'); //
    const errorMessageElement = document.getElementById('error-message-login'); //

    // [BARU] Cek URL parameter untuk menampilkan pesan
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'session_expired') {
        errorMessageElement.textContent = 'Sesi Anda telah berakhir. Silakan login kembali.';
        // Ubah warna pesan agar informatif, bukan seperti eror
        errorMessageElement.style.color = 'var(--primary-color)';
    }

    if (loginForm) { //
        loginForm.addEventListener('submit', async (event) => { //
            event.preventDefault(); //
            // Reset pesan eror setiap kali submit
            errorMessageElement.textContent = ''; //
            errorMessageElement.style.color = ''; // Kembalikan ke warna default (merah untuk eror)
            
            const email = document.getElementById('email').value; //
            const password = document.getElementById('password').value; //

            try {
                await login({ email, password }); //
                window.location.href = 'index.html'; //
            } catch (error) {
                errorMessageElement.textContent = error.message; //
            }
        });
    }
});