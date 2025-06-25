// js/thread-detail.js (Versi Final dengan Fitur Komentar)
import { getThreadById, addCommentToThread, getCurrentUser } from './api.js';
import { formatDisplayDate } from './utils.js';
import { loadLayout } from './layout.js';
import { showToast, showError } from './ui.js';

// Fungsi utama untuk inisialisasi halaman
async function initializePage() {
    await loadLayout();

    const threadContainer = document.getElementById('thread-detail-container');
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get('id');

    if (!threadId) {
        threadContainer.innerHTML = '<p class="error-message">Error: ID thread tidak ditemukan.</p>';
        return;
    }

    // Fungsi untuk merender detail thread, sekarang termasuk memanggil renderComments
    function renderThreadDetail(threadData) {
        document.title = `${threadData.title} - ForumKita`;
        const sanitizedContent = DOMPurify.sanitize(threadData.content, { USE_PROFILES: { html: true } });
        
        threadContainer.innerHTML = `
            <article class="thread-full">
                <h1 class="thread-full__title">${threadData.title}</h1>
                <div class="thread-card__meta">
                    <span>Oleh <strong>${threadData.author.name}</strong></span> •
                    <time>${formatDisplayDate(threadData.createdAt)}</time>
                </div>
                <div class="thread-full__content">${sanitizedContent}</div>
                <div class="thread-full__actions">
                    </div>
            </article>
            <section class="comments-section">
                <h2>${threadData.comments?.length || 0} Komentar</h2>
                <form id="comment-form" class="comment-form">
                    <textarea id="comment-content" placeholder="Tulis komentarmu di sini..." rows="4" required></textarea>
                    <button type="submit" class="btn btn--primary">Kirim Komentar</button>
                </form>
                <div class="comments-list">${renderComments(threadData.comments)}</div>
            </section>`;
    }

    // Fungsi untuk merender daftar komentar
    function renderComments(comments) {
        if (!comments || comments.length === 0) {
            return '<p style="text-align:center; padding: 2rem; color: var(--text-secondary);">Jadilah yang pertama berkomentar!</p>';
        }
        return comments.map(comment => {
            const sanitizedComment = DOMPurify.sanitize(comment.content);
            return `
            <div class="comment">
                <div class="comment__header">
                    <strong>${comment.author.name}</strong>
                    <time>${formatDisplayDate(comment.createdAt)}</time>
                </div>
                <div class="comment__content"><p>${sanitizedComment}</p></div>
            </div>`;
        }).join('');
    }

    // Menggunakan event delegation agar event listener tetap ada setelah re-render
    threadContainer.addEventListener('submit', async (event) => {
        if (event.target.id === 'comment-form') {
            event.preventDefault();
            const form = event.target;
            const contentInput = form.querySelector('#comment-content');
            const submitButton = form.querySelector('button[type="submit"]');

            const content = contentInput.value.trim();
            if (!content) {
                showToast('Komentar tidak boleh kosong.', 'error');
                return;
            }

            const currentUser = getCurrentUser();
            if (!currentUser) {
                showToast('Anda harus login untuk berkomentar.', 'error');
                return;
            }
            
            submitButton.disabled = true;
            submitButton.textContent = 'Mengirim...';

            try {
                // Panggil API untuk menambahkan komentar baru
                await addCommentToThread(threadId, {
                    content: content,
                    author: currentUser.name
                });
                
                // Jika berhasil, ambil data thread terbaru (termasuk komentar baru) dan render ulang
                const updatedThread = await getThreadById(threadId);
                renderThreadDetail(updatedThread);
                showToast('Komentar berhasil ditambahkan!', 'success');

            } catch (error) {
                showError('menambahkan komentar', error);
                // Tombol akan otomatis aktif kembali karena halaman di-render ulang jika berhasil,
                // tapi kita aktifkan manual jika gagal.
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Kirim Komentar';
                }
            }
        }
    });

    // Inisialisasi awal saat halaman dimuat
    try {
        threadContainer.innerHTML = `<div class="loading-spinner"></div>`;
        const threadData = await getThreadById(threadId);
        renderThreadDetail(threadData);
    } catch (error) {
        showError('memuat detail thread', error);
        threadContainer.innerHTML = `<div class="empty-state"><p>Gagal memuat thread.</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', initializePage);