// WeB/js/profile.js (VERSI PERBAIKAN LENGKAP)

import { getUserProfileData } from './api.js'; // Pastikan getUserProfileData sudah diekspor dari api.js
import { formatDisplayDate } from './utils.js';
import { loadLayout } from './layout.js';
import { showError } from './ui.js';
import { protectPage } from './authGuard.js';

async function initializeProfilePage() {
    // 1. Muat komponen layout (navbar, footer)
    await loadLayout();

    // 2. Dapatkan semua elemen yang akan diisi data
    const profileNameEl = document.getElementById('profile-name');
    const threadsCountEl = document.getElementById('profile-threads-count');
    const commentsCountEl = document.getElementById('profile-comments-count');
    const userThreadsListEl = document.getElementById('user-threads-list');
    const joinDateEl = document.querySelector('.profile-info p'); 

    try {
        // 3. Panggil API untuk mendapatkan data profil.
        // [PERBAIKAN] Tidak perlu argumen, karena backend mengidentifikasi user dari token.
        const profileData = await getUserProfileData();

        // 4. Isi semua elemen dengan data yang benar dari API
        if (profileData) {
            profileNameEl.textContent = profileData.name;

            // [PERBAIKAN] Gunakan .length dari array untuk mendapatkan jumlah
            threadsCountEl.textContent = profileData.threads ? profileData.threads.length : 0;
            commentsCountEl.textContent = profileData.comments ? profileData.comments.length : 0;

            // Mengisi tanggal bergabung
            if(joinDateEl && profileData.createdAt) {
                const joinDate = new Date(profileData.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                joinDateEl.textContent = `Bergabung pada: ${joinDate}`;
            }

            // 5. Render daftar thread yang dibuat pengguna
            if (profileData.threads && profileData.threads.length > 0) {
                userThreadsListEl.innerHTML = profileData.threads.map(thread => {
                    // [PERBAIKAN] Pastikan properti yang digunakan benar: 'createdAt', bukan 'timestamp'
                    const creationDate = formatDisplayDate(thread.createdAt);
                    return `
                        <div class="profile-thread-item">
                            <a href="thread.html?id=${thread.id}">${thread.title}</a>
                            <time>${creationDate}</time> 
                        </div>
                    `;
                }).join('');
            } else {
                userThreadsListEl.innerHTML = '<p>Anda belum membuat thread apapun.</p>';
            }
        }
    } catch (error) {
        // 6. Tangani jika terjadi error saat memuat data
        showError('mengambil data profil', error);
        if(profileNameEl) profileNameEl.textContent = 'Gagal memuat profil';
        if(userThreadsListEl) userThreadsListEl.innerHTML = '<p>Tidak dapat memuat thread.</p>';
    }
}

// Jalankan fungsi inisialisasi setelah halaman siap
document.addEventListener('DOMContentLoaded', () => {
    // Jalankan guard SEBELUM melakukan hal lain
    if (protectPage()) {
        // Jika otentikasi berhasil, lanjutkan untuk menginisialisasi halaman
        initializeProfilePage();
    }
    // Jika tidak berhasil, 'protectPage' akan mengurus pengalihan,
    // dan sisa kode tidak akan berjalan.
});