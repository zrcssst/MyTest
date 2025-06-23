// Fungsi untuk memuat konten dari file eksternal dan memasukkannya ke elemen target
const loadComponent = async (url, placeholderId) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Gagal memuat ${url}: ${response.statusText}`);
        }
        const content = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = content;
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
};

// Fungsi spesifik untuk memuat Navbar
const loadNavbar = async () => {
    // Kita panggil loadComponent untuk memuat navbar
    await loadComponent('templates/navbar.html', 'navbar-placeholder');

    // Setelah navbar dimuat, kita perlu menjalankan kembali logika JS untuk navbar
    // seperti manajemen tema, status user, dan notifikasi.
    // Kode ini diambil dan diadaptasi dari global.js
    initializeNavbar(); 
};

// Fungsi spesifik untuk memuat Footer
const loadFooter = () => {
    loadComponent('templates/footer.html', 'footer-placeholder');
};