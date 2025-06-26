// js/main.js (Versi Perbaikan Performa & Alur)

import { getThreads, getForumStats } from './api.js';
import { debounce } from './utils.js';
import { renderLoadingSkeletons, renderEmptyState, showError } from './ui.js';
import { createThreadCard } from './components.js';
import { loadLayout } from './layout.js';
import { protectPage } from './authGuard.js';

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
let threadListContainer, paginationContainer, pageTitle;

const renderThreads = (threads) => {
    if (!threadListContainer) return;
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
        const data = await getThreads(state);
        const threads = data.threads;
        
        state.totalPages = data.totalPages;
        state.currentPage = data.currentPage;
        
        renderThreads(threads);
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

    if (sortButtonsContainer) {
        sortButtonsContainer.addEventListener('click', (e) => {
            if (e.target.matches('.sort-btn') && !e.target.classList.contains('active')) {
                sortButtonsContainer.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                state.sort = e.target.dataset.sort;
                state.currentPage = 1;
                fetchAndRenderThreads();
            }
        });
    }

    if (categoryLinksContainer) {
        categoryLinksContainer.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.matches('.category-link') && !e.target.classList.contains('active')) {
                categoryLinksContainer.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                state.category = e.target.dataset.category;
                state.currentPage = 1;
                if(pageTitle) pageTitle.textContent = e.target.textContent;
                fetchAndRenderThreads();
            }
        });
    }

    if(searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            state.keyword = e.target.value.trim();
            state.currentPage = 1;
            fetchAndRenderThreads();
        }, 400));
    }
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

async function initializeMainPage() {
    await loadLayout();
    
    // Inisialisasi elemen DOM setelah layout dimuat
    threadListContainer = document.getElementById('thread-list-container');
    paginationContainer = document.getElementById('pagination-container');
    pageTitle = document.getElementById('page-title');
    
    showNotificationBanner();
    setupEventListeners();
    fetchAndRenderThreads();
    renderStats();
}

document.addEventListener('DOMContentLoaded', () => {
    if (protectPage()) {
        initializeMainPage();
    }
});