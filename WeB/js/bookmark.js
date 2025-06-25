// js/bookmark.js (Versi setelah refactor)

import { getAllThreads, getBookmarks } from './api.js';
import { createThreadCard } from './components.js'; // <-- [BARU] Impor dari file komponen
import { loadLayout } from './layout.js'; // Impor fungsi baru

document.addEventListener('DOMContentLoaded', async () => {
    // Muat komponen navbar dan footer

    await loadLayout();

    const threadListContainer = document.getElementById('thread-list-container');
    const loadingSpinner = `<div class="loading-spinner"></div>`; // Opsi loading

    const renderEmptyState = (message) => {
        threadListContainer.innerHTML = `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><p>${message}</p></div>`;
    };

    const renderBookmarkedThreads = (threads) => {
        threadListContainer.innerHTML = ''; // Kosongkan container
        if (threads.length === 0) {
            renderEmptyState('Anda belum menyimpan bookmark apapun.');
            return;
        }
        threads.forEach(thread => {
            const card = createThreadCard(thread); // <-- Sekarang menggunakan fungsi yang diimpor
            threadListContainer.appendChild(card);
        });
    };
    
    const initializeBookmarkPage = async () => {
        threadListContainer.innerHTML = loadingSpinner; // Tampilkan loading
        try {
            const allThreads = await getAllThreads();
            const bookmarkedIds = getBookmarks();
            
            // Filter threads yang ID-nya ada di dalam daftar bookmark
            const bookmarkedThreads = allThreads
                .filter(thread => bookmarkedIds.includes(thread.id))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Urutkan dari yang terbaru

            renderBookmarkedThreads(bookmarkedThreads);
        } catch (error) {
            console.error("Gagal memuat bookmark:", error);
            renderEmptyState('Gagal memuat data bookmark. Silakan coba lagi.');
        }
    };

    initializeBookmarkPage();
});