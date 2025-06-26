// WeB/js/authGuard.js

export function protectPage() {
    const token = localStorage.getItem('token');
    const pageContent = document.getElementById('page-content');
    const loader = document.getElementById('full-page-loader');

    if (!token) {
        // Jika tidak ada token, langsung alihkan.
        // Tidak perlu menyembunyikan loader karena halaman akan segera berganti.
        window.location.replace('login.html');
        return false; // Mengindikasikan otentikasi gagal
    } else {
        // Jika ada token, tampilkan konten dan sembunyikan loader
        if (loader) {
            loader.style.display = 'none';
        }
        if (pageContent) {
            pageContent.style.display = 'block';
        }
        return true; // Mengindikasikan otentikasi berhasil
    }
}