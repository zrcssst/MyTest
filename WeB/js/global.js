// js/global.js
document.addEventListener('DOMContentLoaded', () => {
    // Manajer Tampilan Pengguna
    const user = getCurrentUser();
    const navUserSection = document.getElementById('nav-user-section');
    if (navUserSection) {
        if (user) {
            navUserSection.innerHTML = `<a href="profile.html" class="navbar__username" title="Lihat Profil">Halo, ${user.name}</a><button id="logout-btn" class="btn btn--secondary">Logout</button>`;
        } else {
            navUserSection.innerHTML = `<a href="login.html" class="btn btn--primary">Login</a>`;
        }
    }
    
    // Listener untuk tombol logout dengan konfirmasi **[DIUBAH]**
    document.body.addEventListener('click', (e) => { 
        if (e.target.id === 'logout-btn') {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                logout();
            }
        }
    });

    // Manajer Notifikasi **[DIUBAH]**
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    
    const renderNotifications = () => {
        const notifications = getNotifications(); // Mengambil notifikasi dari API
        const dropdownContent = dropdown.querySelector('.notification-dropdown-content');
        
        if (notifications.length === 0) {
            dropdownContent.innerHTML = '<div class="notification-item">Tidak ada notifikasi baru.</div>';
            return;
        }
        
        dropdownContent.innerHTML = notifications.map(notif => 
            `<div class="notification-item">${notif.message}</div>`
        ).join('');
    };

    if (bell && dropdown) {
        bell.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            dropdown.classList.toggle('show');
            if (dropdown.classList.contains('show')) {
                renderNotifications(); // Render notifikasi saat dropdown dibuka
            }
        });
        document.addEventListener('click', () => dropdown.classList.remove('show'));
        dropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    // Manajer Tema
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        const applyTheme = () => {
            const currentTheme = localStorage.getItem('theme');
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggleButton.innerHTML = '<i class="fa-solid fa-sun"></i>';
            } else {
                document.documentElement.removeAttribute('data-theme');
                themeToggleButton.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }
        };

        themeToggleButton.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                localStorage.removeItem('theme');
            } else {
                localStorage.setItem('theme', 'dark');
            }
            applyTheme();
        });
        
        applyTheme(); 
    }
});