// js/navbar.js (Sebelumnya global.js)

import { getCurrentUser, logout, getNotifications } from './api.js';

// Fungsi ini sekarang diekspor untuk dipanggil setelah HTML navbar dimuat.
export function initializeNavbar() {
    // --- Manajemen Tema ---
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
            themeToggleButton.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        };

        themeToggleButton.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        applyTheme(localStorage.getItem('theme'));
    }

    // --- Manajemen Pengguna ---
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

    // --- Logika Notifikasi ---
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    if (bell && dropdown) {
        const renderNotifications = async () => {
            const contentContainer = dropdown.querySelector('.notification-dropdown-content');
            contentContainer.innerHTML = '<div class="notification-item">Memuat...</div>';
            try {
                const notifications = await getNotifications();
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
            } catch (error) {
                contentContainer.innerHTML = '<div class="notification-item">Gagal memuat notifikasi.</div>';
            }
        };

        document.addEventListener('click', (e) => {
            if (bell.contains(e.target)) {
                if (!dropdown.classList.contains('show')) {
                    renderNotifications();
                }
                dropdown.classList.toggle('show');
                return;
            }
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}