// js/global.js

document.addEventListener('DOMContentLoaded', () => {
    // Fungsi untuk mendapatkan pengguna saat ini dari session storage
    function getCurrentUser() {
        const user = sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
    
    // Fungsi untuk logout
    function logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    // --- Manajemen Tampilan Tema (Terang/Gelap) ---
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        // Fungsi untuk menerapkan tema berdasarkan localStorage
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggleButton.innerHTML = '<i class="fa-solid fa-sun"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                themeToggleButton.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }
        };

        // Event listener untuk tombol ganti tema
        themeToggleButton.addEventListener('click', () => {
            let currentTheme = localStorage.getItem('theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        // Terapkan tema saat halaman dimuat
        applyTheme(localStorage.getItem('theme'));
    }

    // --- Manajemen Tampilan Pengguna di Navbar ---
    const navUserSection = document.getElementById('nav-user-section');
    if (navUserSection) {
        const user = getCurrentUser();
        if (user) {
            navUserSection.innerHTML = `
                <a href="profile.html" class="navbar__username" title="Lihat Profil">Halo, ${user.name}</a>
                <button id="logout-btn" class="btn btn--secondary">Logout</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', logout);
        } else {
            navUserSection.innerHTML = `<a href="login.html" class="btn btn--primary">Login</a>`;
        }
    }

    // --- [DIPERBAIKI] Logika Dropdown Notifikasi ---
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');

    if (bell && dropdown) {
        // Fungsi untuk memuat dan merender notifikasi dari API
        const renderNotifications = () => {
            const contentContainer = dropdown.querySelector('.notification-dropdown-content');
            contentContainer.innerHTML = '<div class="notification-item">Memuat...</div>'; // Tampilkan loading
            
            // Panggil API untuk mendapatkan notifikasi (disimulasikan dari api.js)
            const notifications = getNotifications(); // Fungsi ini ada di api.js

            if (notifications && notifications.length > 0) {
                contentContainer.innerHTML = notifications.map(notif => `
                    <div class="notification-item">
                        <i class="fa-solid fa-circle-info"></i>
                        <p>${notif.message}</p>
                    </div>
                `).join('');
            } else {
                contentContainer.innerHTML = '<div class="notification-item">Tidak ada notifikasi baru.</div>';
            }
        };

        // Event listener utama pada dokumen untuk menangani semua klik
        document.addEventListener('click', (e) => {
            // Cek apakah klik berasal dari dalam lonceng
            if (bell.contains(e.target)) {
                const isDropdownVisible = dropdown.classList.contains('show');
                // Jika dropdown akan dibuka, render kontennya
                if (!isDropdownVisible) {
                    renderNotifications();
                }
                // Toggle tampilan dropdown
                dropdown.classList.toggle('show');
                return; // PENTING: Hentikan eksekusi agar tidak lanjut ke pengecekan di bawah
            }

            // Jika dropdown terlihat DAN klik terjadi di luar dropdown, tutup dropdown
            if (dropdown.classList.contains('show') && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
});