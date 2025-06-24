// WeB/js/login.js

import { login } from './api.js';

// Fungsi ini akan berjalan setelah seluruh konten halaman (DOM) selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Mengecek jika pengguna sudah login, langsung arahkan ke halaman utama
    if (sessionStorage.getItem('currentUser')) {
        window.location.href = 'index.html';
    }

    // Mendapatkan elemen-elemen dari halaman HTML
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const errorMessageElement = document.getElementById('error-message-login');

    // Pastikan semua elemen yang dibutuhkan ada
    if (!loginForm || !usernameInput || !errorMessageElement) {
        console.error('Elemen form login tidak ditemukan!');
        return;
    }

    // Menambahkan event listener untuk event 'submit' pada form
    loginForm.addEventListener('submit', (event) => {
        // Mencegah form dari perilaku default-nya (reload halaman)
        event.preventDefault();

        // Mengambil dan membersihkan nilai dari input username
        const username = usernameInput.value.trim();

        // Validasi sederhana: pastikan username tidak kosong
        if (!username) {
            errorMessageElement.textContent = 'Nama pengguna tidak boleh kosong.';
            usernameInput.style.borderColor = 'var(--accent-color)'; // Beri border merah
            usernameInput.focus(); // Fokus ke input
            return;
        }

        // Jika validasi berhasil:
        errorMessageElement.textContent = ''; // Hapus pesan error
        usernameInput.style.borderColor = 'var(--border-color)'; // Kembalikan border ke normal

        // Panggil fungsi login dari api.js untuk menyimpan data pengguna
        login(username);

        // Arahkan pengguna ke halaman utama (index.html) setelah berhasil login
        window.location.href = 'index.html';
    });
});