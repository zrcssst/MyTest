// js/layout.js (File BARU untuk menyederhanakan)
import { loadNavbarHTML, loadFooter } from './templating.js';
import { initializeNavbar } from './navbar.js';

export async function loadLayout() {
    // Muat HTML footer dan navbar secara bersamaan
    await Promise.all([
        loadNavbarHTML(),
        loadFooter()
    ]);
    // Setelah HTML navbar ada, jalankan logikanya
    initializeNavbar();
}