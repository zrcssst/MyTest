// js/bookmark.js (Versi setelah refactor)

import { getBookmarkedThreads } from './api.js'; // [DIUBAH]
import { createThreadCard } from './components.js';
import { loadLayout } from './layout.js';
import { protectPage } from './authGuard.js';

document.addEventListener('DOMContentLoaded', async () => {
    // [PERBAIKAN] Pindahkan semua logika ke dalam blok 'if' setelah authGuard
    if (protectPage()) {
        await loadLayout();

        const threadListContainer = document.getElementById('thread-list-container');

        const renderEmptyState = (message) => {
            threadListContainer.innerHTML = `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><p>${message}</p></div>`;
        };

        const renderBookmarkedThreads = (threads) => {
            threadListContainer.innerHTML = '';
            if (!threads || threads.length === 0) {
                renderEmptyState('Anda belum menyimpan bookmark apapun.');
                return;
            }
            threads.forEach(thread => {
                const card = createThreadCard(thread);
                threadListContainer.appendChild(card);
            });
        };
        
        const initializeBookmarkPage = async () => {
            renderLoadingSkeletons(threadListContainer); // Gunakan fungsi dari ui.js jika ada
            try {
                // [DIUBAH] Panggil API yang sudah efisien
                const bookmarkedThreads = await getBookmarkedThreads();
                renderBookmarkedThreads(bookmarkedThreads);
            } catch (error) {
                console.error("Gagal memuat bookmark:", error);
                renderEmptyState('Gagal memuat data bookmark. Silakan coba lagi.');
            }
        };

        // Panggil fungsi inisialisasi
        initializeBookmarkPage();
    }
});

// Fungsi untuk skeleton loader (bisa dipindah ke ui.js)
function renderLoadingSkeletons(container) {
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        card.innerHTML = `<div class="skeleton title"></div><div class="skeleton text"></div><div class="skeleton text" style="width: 80%;"></div>`;
        container.appendChild(card);
    }
}