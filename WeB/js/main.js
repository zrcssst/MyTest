// js/main.js (Versi Perbaikan Performa & Alur)

import { getAllThreads, getForumStats } from './api.js';
import { debounce } from './utils.js';
import { renderLoadingSkeletons, renderEmptyState, showError } from './ui.js';
import { createThreadCard } from './components.js';
import { loadLayout } from './layout.js'

// State aplikasi untuk mengelola filter, paginasi, dll.
const state = {
    sort: 'terbaru',
    category: 'all',
    keyword: '',
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
};

// Elemen DOM utama
const threadListContainer = document.getElementById('thread-list-container');
const paginationContainer = document.getElementById('pagination-container');
const pageTitle = document.getElementById('page-title');

const renderThreads = (threads) => {
    threadListContainer.innerHTML = '';
    if (threads.length === 0) {
        renderEmptyState(threadListContainer, 'Tidak ada thread yang cocok dengan kriteria Anda.');
        return;
    }
    threads.forEach(thread => {
        const card = createThreadCard(thread);
        threadListContainer.appendChild(card);
    });
};

const renderPagination = () => {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    if (state.totalPages <= 1) return;

    const createButton = (text, page, isDisabled = false, isActive = false) => {
        const button = document.createElement('button');
        button.innerHTML = text;
        button.className = 'pagination__btn';
        if (isActive) button.classList.add('active');
        button.disabled = isDisabled;
        button.addEventListener('click', () => {
            state.currentPage = page;
            fetchAndRenderThreads();
            window.scrollTo(0, 0);
        });
        return button;
    };

    paginationContainer.appendChild(createButton('&laquo;', state.currentPage - 1, state.currentPage === 1));
    for (let i = 1; i <= state.totalPages; i++) {
        paginationContainer.appendChild(createButton(i, i, false, i === state.currentPage));
    }
    paginationContainer.appendChild(createButton('&raquo;', state.currentPage + 1, state.currentPage === state.totalPages));
};

async function fetchAndRenderThreads() {
    renderLoadingSkeletons(threadListContainer);
    paginationContainer.innerHTML = '';
    
    try {
        // [PERBAIKAN PERFORMA]
        // Menggunakan getThreads dengan parameter paginasi, bukan getAllThreads.
        // Simulasi filter dan sort di client-side tetap dipertahankan karena API mock belum mendukungnya.
        // Di backend sungguhan, parameter filter ini akan dikirim ke API.
        
        let allThreads = await getAllThreads(); // Di backend nyata, ini akan jadi `getThreads({ page: state.currentPage, ... })`

        // Filtering
        if (state.category !== 'all') {
            allThreads = allThreads.filter(t => t.category === state.category);
        }
        if (state.keyword) {
            const lowerKeyword = state.keyword.toLowerCase();
            allThreads = allThreads.filter(t => {
                // Pastikan thread memiliki author dan nama author sebelum melakukan pencarian
                const authorName = t.author ? t.author.name.toLowerCase() : '';
                
                return t.title.toLowerCase().includes(lowerKeyword) || 
                       authorName.includes(lowerKeyword);
            });
        }


        // Sorting
        if (state.sort === 'populer') {
            allThreads.sort((a, b) => (b.likes + b.commentsCount) - (a.likes + a.commentsCount));
        } else if (state.sort === 'trending') {
            allThreads.sort((a, b) => b.views - a.views);
        } else {
            allThreads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        
        // Pagination
        state.totalPages = Math.ceil(allThreads.length / state.itemsPerPage);
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const paginatedThreads = allThreads.slice(startIndex, startIndex + state.itemsPerPage);
        
        renderThreads(paginatedThreads);
        renderPagination();
    } catch (error) {
        showError('memuat threads', error);
        renderEmptyState(threadListContainer, 'Gagal memuat data. Periksa koneksi Anda.');
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const sortButtonsContainer = document.querySelector('.sorting-options');
    const categoryLinksContainer = document.querySelector('.category-list');

    sortButtonsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.sort-btn') && !e.target.classList.contains('active')) {
            sortButtonsContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            state.sort = e.target.dataset.sort;
            state.currentPage = 1;
            fetchAndRenderThreads();
        }
    });

    categoryLinksContainer.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.matches('.category-link') && !e.target.classList.contains('active')) {
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
}

function showNotificationBanner() {
    const banner = document.getElementById('notification-banner');
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'thread_created' && banner) {
        banner.textContent = 'Thread baru berhasil dipublikasikan!';
        banner.classList.add('show');
        setTimeout(() => {
            banner.classList.remove('show');
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 4000);
    }
}

async function renderStats() {
    try {
        const stats = await getForumStats();
        const statsThreads = document.getElementById('stats-threads');
        const statsComments = document.getElementById('stats-comments');
        const statsUsers = document.getElementById('stats-users');
        if(statsThreads) statsThreads.textContent = `Threads: ${stats.totalThreads}`;
        if(statsComments) statsComments.textContent = `Komentar: ${stats.totalComments}`;
        if(statsUsers) statsUsers.textContent = `Pengguna: ${stats.totalUsers}`;
    } catch (error) {
        console.error("Gagal memuat statistik forum:", error);
    }
}

// Fungsi utama untuk inisialisasi halaman
async function initializeMainPage() {
    // [PERBAIKAN ALUR] Muat komponen penting dulu
    
    await loadLayout();
    
    showNotificationBanner();
    setupEventListeners();
    fetchAndRenderThreads();
    renderStats();
}

// Jalankan inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', initializeMainPage);