// js/bookmark.js (Versi setelah refactor)

import { getAllThreads, getBookmarks } from './api.js';
import { createThreadCard } from './components.js';
import { loadLayout } from './layout.js';
import { protectPage } from './authGuard.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (protectPage()) {
        // Semua logika inisialisasi halaman berada di dalam blok ini
        await loadLayout();

        const threadListContainer = document.getElementById('thread-list-container');
        const loadingSpinner = `<div class="loading-spinner"></div>`;

        const renderEmptyState = (message) => {
            threadListContainer.innerHTML = `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><p>${message}</p></div>`;
        };

        const renderBookmarkedThreads = (threads) => {
            threadListContainer.innerHTML = '';
            if (threads.length === 0) {
                renderEmptyState('Anda belum menyimpan bookmark apapun.');
                return;
            }
            threads.forEach(thread => {
                const card = createThreadCard(thread);
                threadListContainer.appendChild(card);
            });
        };
        
        const initializeBookmarkPage = async () => {
            threadListContainer.innerHTML = loadingSpinner;
            try {
                // Untuk contoh ini, kita asumsikan bookmark disimpan di client-side,
                // jadi mengambil semua thread masih diperlukan.
                const allThreads = await getAllThreads();
                const bookmarkedIds = getBookmarks();
                
                const bookmarkedThreads = allThreads
                    .filter(thread => bookmarkedIds.includes(thread.id))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                renderBookmarkedThreads(bookmarkedThreads);
            } catch (error) {
                console.error("Gagal memuat bookmark:", error);
                renderEmptyState('Gagal memuat data bookmark. Silakan coba lagi.');
            }
        };

        // Panggil fungsi inisialisasi hanya sekali
        initializeBookmarkPage();
    }
});