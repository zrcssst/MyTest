// js/templating.js

// [PERBAIKAN] Impor fungsi initializeNavbar dari global.js
import { initializeNavbar } from './global.js';

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

// [PERBAIKAN] Sekarang fungsi-fungsi ini bisa diekspor dan diimpor di mana saja
export const loadNavbar = async () => {
    await loadComponent('templates/navbar.html', 'navbar-placeholder');
    initializeNavbar(); // Fungsi ini sekarang sudah diimpor dan dikenali
};

export const loadFooter = async () => {
    await loadComponent('templates/footer.html', 'footer-placeholder');
};