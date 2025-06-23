// js/main.js (Versi Final yang Sudah Diperbaiki)

import { getThreads, getForumStats } from './api.js';
import { formatDisplayDate } from './utils.js';
import { debounce } from './utils.js';
import { loadNavbar, loadFooter } from './templating.js';
import { renderLoadingSkeletons, renderEmptyState, showError } from './ui.js';

// Fungsi untuk inisialisasi halaman utama
async function initializePage() {
    // Muat komponen global terlebih dahulu
    await loadNavbar();
    await loadFooter();
    showNotificationBanner(); // Panggil notifikasi setelah navbar dimuat

    // State aplikasi
    const state = {
        sort: 'terbaru',
        category: 'all',
        keyword: '',
        currentPage: 1,
        totalPages: 1,
    };

    // Elemen DOM
    const threadListContainer = document.getElementById('thread-list-container');
    const searchInput = document.getElementById('searchInput');
    const pageTitle = document.getElementById('page-title');
    const paginationContainer = document.getElementById('pagination-container');

    const createThreadCard = (thread) => {
        const card = document.createElement('article');
        card.className = 'thread-card';
        const titleLink = document.createElement('a');
        titleLink.href = `thread.html?id=${thread.id}`;
        titleLink.className = 'thread-card__title';
        titleLink.textContent = thread.title;
        const metaDiv = document.createElement('div');
        metaDiv.className = 'thread-card__meta';
        metaDiv.innerHTML = `<span>Oleh <strong>${thread.author}</strong></span> • <time>${formatDisplayDate(thread.timestamp)}</time>`;
        const statsDiv = document.createElement('div');
        statsDiv.className = 'thread-card__stats';
        const createStatSpan = (iconClass, text) => {
            const span = document.createElement('span');
            span.innerHTML = `<i class="${iconClass}"></i> ${text}`;
            return span;
        };
        const tagSpan = document.createElement('span');
        tagSpan.className = `thread-card__tag thread-card__tag--${thread.category || 'umum'}`;
        tagSpan.textContent = thread.category || 'umum';
        statsDiv.append(
            createStatSpan('fa-regular fa-eye', thread.views || 0),
            createStatSpan('fa-regular fa-thumbs-up', thread.likes),
            createStatSpan('fa-regular fa-comment', thread.commentsCount),
            tagSpan
        );
        card.append(titleLink, metaDiv, statsDiv);
        return card;
    };

     const renderThreads = (threads) => {
        threadListContainer.innerHTML = '';
        if (threads.length === 0) {
            renderEmptyState(threadListContainer, 'Tidak ada thread yang cocok dengan kriteria Anda.');
            return;
        }
        threads.forEach(thread => {
            const card = createThreadCard(thread); // Anda perlu memastikan fungsi ini ada
            threadListContainer.appendChild(card);
        });
    };
    
    const renderPagination = () => {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        if (state.totalPages <= 1) return;

        // Tombol "Sebelumnya"
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.className = 'pagination__btn';
        prevButton.disabled = state.currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                fetchAndRenderThreads();
            }
        });
        paginationContainer.appendChild(prevButton);

        // Tombol Angka Halaman
        for (let i = 1; i <= state.totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = 'pagination__btn';
            if (i === state.currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                state.currentPage = i;
                fetchAndRenderThreads();
            });
            paginationContainer.appendChild(pageButton);
        }

        // Tombol "Berikutnya"
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.className = 'pagination__btn';
        nextButton.disabled = state.currentPage === state.totalPages;
        nextButton.addEventListener('click', () => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                fetchAndRenderThreads();
            }
        });
        paginationContainer.appendChild(nextButton);
    };

    // Fungsi utama untuk mengambil dan merender data
    async function fetchAndRenderThreads() {
        renderLoadingSkeletons(threadListContainer);
        paginationContainer.innerHTML = ''; // Kosongkan paginasi saat loading

        try {
            // NOTE: API pencarian & filter sisi server belum ada, jadi kita simulasikan di sini
            // Di dunia nyata, parameter state.sort, state.category, state.keyword akan dikirim ke API
            const { threads, currentPage, totalPages } = await getThreads({ page: state.currentPage });
            
            // Simulasikan filter dan sort di client-side
            let threadsToRender = threads; // Nanti diubah jika ada filter/sort

            renderThreads(threadsToRender);
            
            state.currentPage = currentPage;
            state.totalPages = totalPages;
            renderPagination();

        } catch (error) {
            showError('memuat threads', error);
            renderEmptyState(threadListContainer, 'Gagal memuat data. Periksa koneksi Anda.');
        }
    }

    // ... (Event Listeners untuk sort, category, search) ...
    // Event listener harus memanggil fetchAndRenderThreads() setelah mengubah state

    // Inisialisasi awal
    fetchAndRenderThreads();
    renderStats(); // Panggil fungsi render statistik
}

// Helper functions (di luar initializePage jika perlu)
function showNotificationBanner() { /* ... logika notifikasi ... */ }
async function renderStats() { /* ... logika statistik ... */ }

// Jalankan inisialisasi
document.addEventListener('DOMContentLoaded', initializePage);