// WeB/js/profile.js (VERSI FINAL)

import { getUserProfileData } from './api.js';
import { formatDisplayDate } from './utils.js';
import { loadLayout } from './layout.js';
import { showError } from './ui.js';
import { protectPage } from './authGuard.js';

document.addEventListener('DOMContentLoaded', () => {
    // [PERBAIKAN] Jalankan guard SEBELUM melakukan hal lain
    if (protectPage()) {
        // Jika otentikasi berhasil, lanjutkan inisialisasi halaman
        initializeProfilePage();
    }
});

async function initializeProfilePage() {
    await loadLayout();

    const profileNameEl = document.getElementById('profile-name');
    const threadsCountEl = document.getElementById('profile-threads-count');
    const commentsCountEl = document.getElementById('profile-comments-count');
    const userThreadsListEl = document.getElementById('user-threads-list');
    const joinDateEl = document.querySelector('.profile-info p');

    try {
        const profileData = await getUserProfileData();

        if (profileData) {
            profileNameEl.textContent = profileData.name;
            threadsCountEl.textContent = profileData.threads ? profileData.threads.length : 0;
            commentsCountEl.textContent = profileData.comments ? profileData.comments.length : 0;

            if(joinDateEl && profileData.createdAt) {
                const joinDate = new Date(profileData.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                joinDateEl.textContent = `Bergabung pada: ${joinDate}`;
            }

            if (profileData.threads && profileData.threads.length > 0) {
                userThreadsListEl.innerHTML = profileData.threads.map(thread => `
                    <div class="profile-thread-item">
                        <a href="thread.html?id=${thread.id}">${thread.title}</a>
                        <time>${formatDisplayDate(thread.createdAt)}</time> 
                    </div>
                `).join('');
            } else {
                userThreadsListEl.innerHTML = '<p>Anda belum membuat thread apapun.</p>';
            }
        }
    } catch (error) {
        showError('mengambil data profil', error);
        if(profileNameEl) profileNameEl.textContent = 'Gagal memuat profil';
        if(userThreadsListEl) userThreadsListEl.innerHTML = '<p>Tidak dapat memuat thread.</p>';
    }
}