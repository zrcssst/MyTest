document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser(); // Fungsi ini dari api.js
    if (user) {
        // Fungsi getUserProfileData sudah ada di api.js
        const profileData = getUserProfileData(user.name);
        
        // Mengisi data profil dasar
        document.getElementById('profile-name').textContent = profileData.name;
        document.getElementById('profile-threads-count').textContent = profileData.threadCount;
        document.getElementById('profile-comments-count').textContent = profileData.commentCount;
        document.getElementById('profile-likes-count').textContent = profileData.likesReceived;

        // Merender daftar thread yang dibuat oleh pengguna
        const threadsListContainer = document.getElementById('user-threads-list');
        if (profileData.threads && profileData.threads.length > 0) {
            threadsListContainer.innerHTML = profileData.threads.map(thread => `
                <div class="profile-thread-item">
                    <a href="thread.html?id=${thread.id}">${thread.title}</a>
                    <time>${formatDisplayDate(thread.timestamp)}</time> 
                </div>
            `).join('');
        } else {
            threadsListContainer.innerHTML = '<p>Anda belum membuat thread apapun.</p>';
        }
    }
});