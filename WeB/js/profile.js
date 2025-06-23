// js/profile.js

// [PERBAIKAN] Impor fungsi yang dibutuhkan dari file lain.
import { getCurrentUser, getUserProfileData } from './api.js';
import { formatDisplayDate } from './utils.js';
import { loadNavbar, loadFooter } from './templating.js'; // <-- Tambahkan ini untuk memuat komponen global

document.addEventListener('DOMContentLoaded', async () => {
    // [PERBAIKAN] Muat navbar dan footer terlebih dahulu
    await loadNavbar();
    await loadFooter();
    
    // Ambil data pengguna yang sedang login
    const user = getCurrentUser(); 

    // Pastikan ada pengguna yang login
    if (user) {
        const profileData = await getUserProfileData(user.name);

        if (profileData) {
            // Mengisi data profil dasar
            document.getElementById('profile-name').textContent = profileData.name;
            document.getElementById('profile-threads-count').textContent = profileData.threadCount;
            document.getElementById('profile-comments-count').textContent = profileData.commentCount;
            document.getElementById('profile-likes-count').textContent = profileData.likesReceived;

            // Merender daftar thread yang dibuat oleh pengguna
            const threadsListContainer = document.getElementById('user-threads-list');
            if (profileData.threads && profileData.threads.length > 0) {
                // Sekarang `formatDisplayDate` sudah dikenali
                threadsListContainer.innerHTML = profileData.threads.map(thread => `
                    <div class="profile-thread-item">
                        <a href="thread.html?id=${thread.id}">${thread.title}</a>
                        <time>${formatDisplayDate(thread.timestamp)}</time> 
                    </div>
                `).join('');
            } else {
                threadsListContainer.innerHTML = '<p>Anda belum membuat thread apapun.</p>';
            }
        } else {
            // Penanganan jika data profil gagal dimuat
            document.getElementById('profile-name').textContent = 'Gagal memuat data';
        }
    }
});