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
    document.body.addEventListener('click', (e) => { if (e.target.id === 'logout-btn') logout(); });

    // Manajer Notifikasi
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    if (bell && dropdown) {
        bell.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('show'); });
        document.addEventListener('click', () => dropdown.classList.remove('show'));
        dropdown.addEventListener('click', (e) => e.stopPropagation());
    }
    document.body.addEventListener('click', (event) => { if (event.target.id === 'logout-btn') { logout(); } });
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