// js/global.js

// Fungsi ini akan menginisialisasi semua fungsionalitas di dalam navbar
// Setelah elemen-elemennya berhasil dimuat oleh templating.js
function initializeNavbar() {
    // --- Manajemen Tampilan Tema (Terang/Gelap) ---
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggleButton.innerHTML = '<i class="fa-solid fa-sun"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                themeToggleButton.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }
        };

        themeToggleButton.addEventListener('click', () => {
            let currentTheme = localStorage.getItem('theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        applyTheme(localStorage.getItem('theme'));
    }

    // --- Manajemen Tampilan Pengguna di Navbar ---
    const navUserSection = document.getElementById('nav-user-section');
    if (navUserSection) {
        const user = getCurrentUser(); // <-- Fungsi ini sekarang memanggil dari api.js
        if (user) {
            navUserSection.innerHTML = `
                <a href="profile.html" class="navbar__username" title="Lihat Profil">Halo, ${user.name}</a>
                <button id="logout-btn" class="btn btn--secondary">Logout</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', logout); // <-- Fungsi ini juga dari api.js
        } else {
            navUserSection.innerHTML = `<a href="login.html" class="btn btn--primary">Login</a>`;
        }
    }

    // --- Pencarian di Navbar ---
    const searchForm = document.getElementById('search-form');
        if (searchForm) {
           /* searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Mencegah form submit secara default
            const searchInput = document.getElementById('searchInput');
            const query = searchInput.value.trim();
        if (query) {
            window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        }
    }); */
     searchForm.addEventListener('submit', (e) => e.preventDefault());
    }


    // --- Logika Dropdown Notifikasi ---
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    if (bell && dropdown) {
        const renderNotifications = async () => {
            const contentContainer = dropdown.querySelector('.notification-dropdown-content');
            contentContainer.innerHTML = '<div class="notification-item">Memuat...</div>';
            
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
        };

       document.addEventListener('click', (e) => {
            if (bell.contains(e.target)) {
                const isDropdownVisible = dropdown.classList.contains('show');
                if (!isDropdownVisible) {
                    renderNotifications();
                }
                dropdown.classList.toggle('show');
                return; 
            }

            if (dropdown.classList.contains('show') && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

// Panggil fungsi pemuat template saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadFooter();
});