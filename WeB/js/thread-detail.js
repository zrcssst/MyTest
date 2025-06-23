// js/thread-detail.js
import { getThreadById, addLikeToThread, addDislikeToThread, toggleBookmark, isBookmarked, addCommentToThread, incrementViewCount, getCurrentUser } from './api.js';
import { formatDisplayDate } from './utils.js';
import { loadNavbar, loadFooter } from './templating.js';
import { showToast, showError } from './ui.js';

async function initializePage() {
    await loadNavbar();
    await loadFooter();

    const threadContainer = document.getElementById('thread-detail-container');
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get('id');

    if (!threadId) {
        threadContainer.innerHTML = '<p class="error-message">Error: ID thread tidak ditemukan.</p>';
        return;
    }

    let currentThread; // Variabel untuk menyimpan data thread saat ini

    // Fungsi untuk memperbarui tampilan tombol bookmark
    const updateBookmarkButton = (button, isCurrentlyBookmarked) => {
        if (!button) return;
        if (isCurrentlyBookmarked) {
            button.classList.add('active');
            button.innerHTML = '<i class="fa-solid fa-bookmark"></i> Disimpan';
        } else {
            button.classList.remove('active');
            button.innerHTML = '<i class="fa-regular fa-bookmark"></i> Simpan';
        }
    };

    // Fungsi untuk merender detail thread
    function renderThreadDetail(threadData) {
        document.title = `${threadData.title} - ForumKita`;
        const sanitizedContent = DOMPurify.sanitize(threadData.content, { USE_PROFILES: { html: true } });
        const voteScore = (threadData.likes || 0) - (threadData.dislikes || 0);
        threadContainer.innerHTML = `
            <article class="thread-full">
                <h1 class="thread-full__title">${threadData.title}</h1>
                <div class="thread-card__meta"><span>Oleh <strong>${threadData.author}</strong></span> • <time>${new Date(threadData.timestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</time></div>
                <div class="thread-full__content">${sanitizedContent}</div>
                <div class="thread-full__actions">
                    <button class="btn-action like-btn"><i class="fa-regular fa-thumbs-up"></i> Suka</button>
                    <span class="vote-score">${voteScore}</span>
                    <button class="btn-action dislike-btn"><i class="fa-regular fa-thumbs-down"></i> Tidak Suka</button>
                    <button class="btn-action bookmark-btn"></button> <button class="btn-action"><i class="fa-regular fa-flag"></i> Laporkan</button>
                </div>
            </article>
            <section class="comments-section">
                <h2>${threadData.commentsCount} Komentar</h2>
                <form id="comment-form" class="comment-form">
                    <textarea id="comment-content" placeholder="Tulis komentarmu di sini..." rows="4" required></textarea>
                    <button type="submit" class="btn btn--primary">Kirim Komentar</button>
                </form>
                <div class="comments-list">${renderComments(threadData.comments)}</div>
            </section>`;
        
        updateBookmarkButton(threadContainer.querySelector('.bookmark-btn'), isBookmarked(threadId));
    }

    // Fungsi untuk merender daftar komentar
    function renderComments(comments) {
        if (!comments || comments.length === 0) { return '<p style="text-align:center; padding: 2rem; color: var(--text-secondary);">Jadilah yang pertama berkomentar!</p>'; }
        // Komentar terbaru di atas
        return comments.map(comment => {
            const voteScore = (comment.likes || 0) - (comment.dislikes || 0);
            const sanitizedComment = DOMPurify.sanitize(comment.content);
            return `
            <div class="comment">
                <div class="comment__header">
                    <strong>${comment.author}</strong>
                    <time>${formatDisplayDate(comment.timestamp)}</time>
                </div>
                <div class="comment__content"><p>${sanitizedComment}</p></div>
                <div class="comment__actions">
                    <button class="btn-action comment-like-btn" data-comment-id="${comment.id}"><i class="fa-regular fa-thumbs-up"></i></button>
                    <span class="comment-vote-score">${voteScore}</span>
                    <button class="btn-action comment-dislike-btn" data-comment-id="${comment.id}"><i class="fa-regular fa-thumbs-down"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    // Event delegation untuk semua aksi di dalam container
    threadContainer.addEventListener('click', async (event) => {
        const target = event.target;
        
        const likeButton = target.closest('.like-btn');
        const dislikeButton = target.closest('.dislike-btn');
        const bookmarkButton = target.closest('.bookmark-btn');

        // Aksi Like Thread
        if (likeButton && !likeButton.disabled) {
            likeButton.disabled = true;
            try {
                await addLikeToThread(threadId);
                currentThread.likes++;
                renderThreadDetail(currentThread); // Re-render untuk update
                showToast('Thread disukai!');
            } catch (error) { showError('menyukai thread', error); } 
        }

        // Aksi Dislike Thread
        if (dislikeButton && !dislikeButton.disabled) {
            dislikeButton.disabled = true;
            try {
                await addDislikeToThread(threadId);
                currentThread.dislikes++;
                renderThreadDetail(currentThread); // Re-render untuk update
            } catch (error) { showError('memberi dislike', error); }
        }

        // Aksi Bookmark
        if (bookmarkButton) {
            try {
                toggleBookmark(threadId);
                const bookmarked = isBookmarked(threadId);
                updateBookmarkButton(bookmarkButton, bookmarked);
                showToast(bookmarked ? 'Bookmark ditambahkan' : 'Bookmark dihapus');
            } catch (error) { showError('menyimpan bookmark', error); }
        }
    });

    // Event listener untuk form komentar
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
            
            submitButton.disabled = true;
            submitButton.textContent = 'Mengirim...';

            try {
                currentThread = await addCommentToThread(threadId, content);
                renderThreadDetail(currentThread); // Re-render semua untuk menampilkan komentar baru
                showToast('Komentar berhasil ditambahkan!', 'success');
                // Gulir ke komentar baru jika perlu
            } catch (error) {
                showError('menambahkan komentar', error);
            } finally {
                // Tidak perlu enable button lagi karena seluruhnya di-render ulang
            }
        }
    });


    // Inisialisasi awal saat halaman dimuat
    try {
        await incrementViewCount(threadId);
        currentThread = await getThreadById(threadId);
        if (currentThread) {
            renderThreadDetail(currentThread);
        } else {
             threadContainer.innerHTML = `<p class="error-message">Gagal memuat thread. Mungkin thread telah dihapus.</p>`;
        }
    } catch (error) {
        showError('memuat detail thread', error);
        threadContainer.innerHTML = `<p class="error-message">Gagal memuat thread. Mungkin thread telah dihapus.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', initializePage);