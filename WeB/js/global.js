// js/global.js (Versi Debugging untuk Melacak Masalah)
document.addEventListener('DOMContentLoaded', () => {
    console.log('HALAMAN SIAP: Skrip global.js telah dimuat.');

    // --- KITA FOKUS HANYA PADA BAGIAN INI ---
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');

    // Pastikan elemennya ada di halaman ini
    if (bell && dropdown) {
        console.log('DEBUG: Elemen notifikasi (bell & dropdown) berhasil ditemukan.');

        document.addEventListener('click', (e) => {
            console.log('--- Klik Terdeteksi ---');

            const isClickInsideBell = bell.contains(e.target);
            const isClickInsideDropdown = dropdown.contains(e.target);
            const isDropdownVisible = dropdown.classList.contains('show');

            // Menampilkan status setiap kali ada klik
            console.log(`Status -> Diklik di dalam lonceng? ${isClickInsideBell}`);
            console.log(`Status -> Diklik di dalam dropdown? ${isClickInsideDropdown}`);
            console.log(`Status -> Dropdown sedang terlihat? ${isDropdownVisible}`);

            // Logika utama untuk membuka/menutup
            if (isClickInsideBell) {
                console.log('AKSI: Membuka/menutup dropdown karena lonceng diklik.');
                dropdown.classList.toggle('show');
                return; // Menghentikan proses lebih lanjut jika lonceng diklik
            }

            // Logika untuk menutup jika klik di luar
            if (!isClickInsideDropdown && isDropdownVisible) {
                console.log('AKSI: Menutup dropdown karena klik terjadi di luar.');
                dropdown.classList.remove('show');
            }
        });

    } else {
        console.log('INFO: Elemen notifikasi tidak ditemukan di halaman ini (ini normal untuk halaman login).');
    }


    // --- BAGIAN LAIN SEMENTARA DIBIARKAN AGAR TIDAK MENGGANGGU ---

    // Manajer Tampilan Pengguna (tetap ada agar tidak error)
    const user = getCurrentUser();
    const navUserSection = document.getElementById('nav-user-section');
    if (navUserSection) {
        if (user) {
            navUserSection.innerHTML = `<a href="profile.html" class="navbar__username" title="Lihat Profil">Halo, ${user.name}</a><button id="logout-btn" class="btn btn--secondary">Logout</button>`;
        } else {
            navUserSection.innerHTML = `<a href="login.html" class="btn btn--primary">Login</a>`;
        }
    }
     // Manajer Tema (tetap ada agar tidak error)
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
    // Fungsi logout harus ada agar tidak error
    function logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
    function getCurrentUser() {
        const user = sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
});