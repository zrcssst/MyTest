// js/templating.js (Versi Perbaikan)

// Fungsi ini sekarang lebih fokus: hanya memuat HTML.
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
        const placeholder = document.getElementById(placeholderId);
        if(placeholder) placeholder.innerHTML = `<p>Gagal memuat komponen.</p>`;
    }
};

// Ekspor fungsi untuk memuat navbar HTML.
export const loadNavbarHTML = async () => {
    await loadComponent('templates/navbar.html', 'navbar-placeholder');
};

// Ekspor fungsi untuk memuat footer.
export const loadFooter = async () => {
    await loadComponent('templates/footer.html', 'footer-placeholder');
};