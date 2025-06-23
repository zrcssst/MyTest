// js/main.js (Versi setelah refactor)

import { getThreads, getForumStats } from './api.js';
import { debounce, formatDisplayDate } from './utils.js';
import { renderLoadingSkeletons, renderEmptyState, showError } from './ui.js';
import { createThreadCard } from './components.js'; // <-- [BARU] Impor dari file komponen

// Fungsi untuk inisialisasi halaman utama
async function initializeMainPage() {
    showNotificationBanner();

    // State aplikasi
    const state = {
        sort: 'terbaru',
        category: 'all',
        keyword: '',
        currentPage: 1,
        itemsPerPage: 10
    };

    // Elemen DOM
    const threadListContainer = document.getElementById('thread-list-container');
    const searchInput = document.getElementById('searchInput');
    const pageTitle = document.getElementById('page-title');
    const paginationContainer = document.getElementById('pagination-container');
    const sortButtonsContainer = document.querySelector('.sorting-options');
    const categoryLinksContainer = document.querySelector('.category-list');

    // [DIHAPUS] Fungsi createThreadCard yang lama sudah dihapus dari sini

    const renderThreads = (threads) => {
        threadListContainer.innerHTML = '';
        if (threads.length === 0) {
            renderEmptyState(threadListContainer, 'Tidak ada thread yang cocok dengan kriteria Anda.');
            return;
        }
        threads.forEach(thread => {
            const card = createThreadCard(thread); // <-- Sekarang menggunakan fungsi yang diimpor
            threadListContainer.appendChild(card);
        });
    };
    
    const renderPagination = (totalPages) => {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        const createButton = (text, page, isDisabled = false) => {
            const button = document.createElement('button');
            button.innerHTML = text;
            button.className = 'pagination__btn';
            button.disabled = isDisabled;
            if (page === state.currentPage) button.classList.add('active');
            button.addEventListener('click', () => {
                state.currentPage = page;
                fetchAndRenderThreads();
                window.scrollTo(0, 0);
            });
            return button;
        };
        
        paginationContainer.appendChild(createButton('&laquo;', state.currentPage - 1, state.currentPage === 1));
        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.appendChild(createButton(i, i));
        }
        paginationContainer.appendChild(createButton('&raquo;', state.currentPage + 1, state.currentPage === totalPages));
    };

    async function fetchAndRenderThreads() {
        renderLoadingSkeletons(threadListContainer);
        paginationContainer.innerHTML = '';
        try {
            let allThreads = await getAllThreads(); // Menggunakan getAllThreads untuk filter client-side

            if (state.category !== 'all') {
                allThreads = allThreads.filter(t => t.category === state.category);
            }
            if (state.keyword) {
                const lowerKeyword = state.keyword.toLowerCase();
                allThreads = allThreads.filter(t => t.title.toLowerCase().includes(lowerKeyword) || t.author.toLowerCase().includes(lowerKeyword));
            }
            if (state.sort === 'populer') {
                allThreads.sort((a, b) => (b.likes + b.commentsCount) - (a.likes + a.commentsCount));
            } else if (state.sort === 'trending') {
                allThreads.sort((a, b) => b.views - a.views);
            } else {
                allThreads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }
            
            const totalPages = Math.ceil(allThreads.length / state.itemsPerPage);
            const startIndex = (state.currentPage - 1) * state.itemsPerPage;
            const paginatedThreads = allThreads.slice(startIndex, startIndex + state.itemsPerPage);
            
            renderThreads(paginatedThreads);
            renderPagination(totalPages);
        } catch (error) {
            showError('memuat threads', error);
            renderEmptyState(threadListContainer, 'Gagal memuat data. Periksa koneksi Anda.');
        }
    }

    // Event Listeners
    sortButtonsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.sort-btn')) {
            sortButtonsContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            state.sort = e.target.dataset.sort;
            state.currentPage = 1;
            fetchAndRenderThreads();
        }
    });
    categoryLinksContainer.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.matches('.category-link')) {
            categoryLinksContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            state.category = e.target.dataset.category;
            state.currentPage = 1;
            pageTitle.textContent = e.target.textContent;
            fetchAndRenderThreads();
        }
    });
    searchInput.addEventListener('input', debounce((e) => {
        state.keyword = e.target.value.trim();
        state.currentPage = 1;
        fetchAndRenderThreads();
    }, 400));

    fetchAndRenderThreads();
    renderStats();
}

// Helper functions
function showNotificationBanner() {
    const banner = document.getElementById('notification-banner');
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'thread_created') {
        banner.textContent = 'Thread baru berhasil dipublikasikan!';
        banner.classList.add('show');
        setTimeout(() => {
            banner.classList.remove('show');
            // Hapus parameter dari URL tanpa reload
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 4000);
    }
}

async function renderStats() {
    try {
        const stats = await getForumStats();
        document.getElementById('stats-threads').textContent = `Threads: ${stats.totalThreads}`;
        document.getElementById('stats-comments').textContent = `Komentar: ${stats.totalComments}`;
        document.getElementById('stats-users').textContent = `Pengguna: ${stats.totalUsers}`;
    } catch (error) {
        console.error("Gagal memuat statistik forum:", error);
    }
}

// Menjadikan fungsi initializeMainPage global agar bisa dipanggil oleh global.js setelah navbar dimuat
window.initializeMainPage = initializeMainPage;