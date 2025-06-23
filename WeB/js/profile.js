// js/profile.js

// Gunakan 'async' pada event listener agar kita bisa memakai 'await' di dalamnya
document.addEventListener('DOMContentLoaded', async () => {
    // Ambil data pengguna yang sedang login
    const user = getCurrentUser(); // Fungsi ini dari api.js

    // Pastikan ada pengguna yang login
    if (user) {
        // Panggil fungsi getUserProfileData dan 'tunggu' (await) hingga Promise selesai dan data diterima
        const profileData = await getUserProfileData(user.name);

        // Pastikan profileData tidak null atau undefined sebelum digunakan
        if (profileData) {
            // Mengisi data profil dasar
            document.getElementById('profile-name').textContent = profileData.name;
            document.getElementById('profile-threads-count').textContent = profileData.threadCount;
            document.getElementById('profile-comments-count').textContent = profileData.commentCount;
            document.getElementById('profile-likes-count').textContent = profileData.likesReceived;

            // Merender daftar thread yang dibuat oleh pengguna
            const threadsListContainer = document.getElementById('user-threads-list');
            if (profileData.threads && profileData.threads.length > 0) {
                // Gunakan fungsi formatDisplayDate dari utils.js
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