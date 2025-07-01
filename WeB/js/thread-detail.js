// WeB/js/thread-detail.js (Versi Final dengan DOM API Penuh)

import { getThreadById, addCommentToThread, addLikeToThread, addDislikeToThread, addBookmark, removeBookmark } from './api.js';
import { formatDisplayDate } from './utils.js';
import { loadLayout } from './layout.js';
import { showToast, showError } from './ui.js';
import { protectPage } from './authGuard.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (protectPage()) {
        // -- AWAL DARI SEMUA LOGIKA HALAMAN --
        await loadLayout();
        const threadContainer = document.getElementById('thread-detail-container');
        const params = new URLSearchParams(window.location.search);
        const threadId = params.get('id');

        if (!threadId) {
            threadContainer.innerHTML = '<p class="error-message">Error: ID thread tidak ditemukan.</p>';
            return;
        }

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

        function renderThreadDetail(threadData) {
            document.title = `${threadData.title} - ForumKita`;
            threadContainer.innerHTML = '';

            const article = document.createElement('article');
            article.className = 'thread-full';
            article.innerHTML = `
                <h1 class="thread-full__title">${threadData.title}</h1>
                <div class="thread-card__meta"><span>Oleh <strong>${threadData.author.name}</strong></span> • <time>${formatDisplayDate(threadData.createdAt)}</time></div>
                <div class="thread-full__content">${DOMPurify.sanitize(threadData.content, { USE_PROFILES: { html: true } })}</div>
            `;

             const actionsDiv = document.createElement('div');
    actionsDiv.className = 'thread-full__actions';

    // 2. Buat semua tombol (Like, Dislike, Bookmark)
    const likeBtn = document.createElement('button');
    likeBtn.className = 'btn-action';
    likeBtn.id = 'like-btn';
    likeBtn.dataset.threadId = threadData.id;
    likeBtn.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> Suka`;
    const likeScore = document.createElement('span');
    likeScore.className = 'vote-score';
    likeScore.textContent = threadData.likes || 0;

    const dislikeBtn = document.createElement('button');
    dislikeBtn.className = 'btn-action';
    dislikeBtn.id = 'dislike-btn';
    dislikeBtn.dataset.threadId = threadData.id;
    dislikeBtn.innerHTML = `<i class="fa-regular fa-thumbs-down"></i> Tidak Suka`;
    const dislikeScore = document.createElement('span');
    dislikeScore.className = 'vote-score';
    dislikeScore.textContent = threadData.dislikes || 0;

    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'btn-action';
    bookmarkBtn.id = 'bookmark-btn';
    bookmarkBtn.dataset.threadId = threadData.id;
    if (threadData.isBookmarked) {
        bookmarkBtn.classList.add('active');
        bookmarkBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i> Disimpan`;
        bookmarkBtn.dataset.bookmarked = "true";
    } else {
        bookmarkBtn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Simpan`;
        bookmarkBtn.dataset.bookmarked = "false";
    }
       const bookmarkScore = document.createElement('span');
    bookmarkScore.className = 'vote-score'; 
    bookmarkScore.id = 'bookmark-score';
    bookmarkScore.textContent = threadData.bookmarksCount || 0;

     actionsDiv.append(likeBtn, likeScore, dislikeBtn, dislikeScore, bookmarkBtn, bookmarkScore);
    article.appendChild(actionsDiv);

    const commentsSection = document.createElement('section');
    commentsSection.className = 'comments-section';
    commentsSection.innerHTML = `
        <h2>${threadData.comments?.length || 0} Komentar</h2>
        <form id="comment-form" class="comment-form">
            <textarea id="comment-content" placeholder="Tulis komentarmu di sini..." rows="4" required></textarea>
            <button type="submit" class="btn btn--primary">Kirim Komentar</button>
        </form>
        <div class="comments-list">${renderComments(threadData.comments)}</div>
    `;
    
    threadContainer.append(article, commentsSection);
}

        threadContainer.addEventListener('click', async (event) => {
    const target = event.target.closest('button');
    if (!target) return; 

    const threadId = target.dataset.threadId;

   if (target.id === 'bookmark-btn') {
                target.disabled = true;
                const isBookmarked = target.dataset.bookmarked === 'true';
                const bookmarkScoreEl = threadContainer.querySelector('#bookmark-score');
        try {
             
             if (isBookmarked) {
                        await removeBookmark(threadId); // Panggil API untuk menghapus
                        target.innerHTML = `<i class="fa-regular fa-bookmark"></i> Simpan`;
                        target.classList.remove('active');
                        target.dataset.bookmarked = "false";
                        if (bookmarkScoreEl) bookmarkScoreEl.textContent = Math.max(0, parseInt(bookmarkScoreEl.textContent) - 1);
                        showToast('Bookmark dihapus!', 'success');
                    } else {
                        await addBookmark(threadId); // Panggil API untuk menambah
                        target.innerHTML = `<i class="fa-solid fa-bookmark"></i> Disimpan`;
                        target.classList.add('active');
                        target.dataset.bookmarked = "true";
                        if (bookmarkScoreEl) bookmarkScoreEl.textContent = parseInt(bookmarkScoreEl.textContent) + 1;
                        showToast('Bookmark ditambahkan!', 'success');
                    }
        } catch (error) {
            if (error.message && error.message.includes("sudah di-bookmark")) {
                target.innerHTML = `<i class="fa-solid fa-bookmark"></i> Disimpan`;
                target.classList.add('active');
                target.dataset.bookmarked = "true";
                showToast('Thread ini memang sudah disimpan.', 'success');
            } else {
                showError('memperbarui bookmark', error);
            }
        } finally {
            target.disabled = false;
        }
        return;
    }

    if (target.id === 'like-btn' || target.id === 'dislike-btn') {
        target.disabled = true;
        try {
            const action = target.id === 'like-btn' ? addLikeToThread : addDislikeToThread;
            // Sekarang threadId sudah dikenal di sini
            const updatedThread = await action(threadId);
            const likeScoreEl = threadContainer.querySelector('#like-btn + .vote-score');
            const dislikeScoreEl = threadContainer.querySelector('#dislike-btn + .vote-score');
            if (likeScoreEl) likeScoreEl.textContent = updatedThread.likes || 0;
            if (dislikeScoreEl) dislikeScoreEl.textContent = updatedThread.dislikes || 0;
        } catch (error) {
            showError(`melakukan ${target.id === 'like-btn' ? 'like' : 'dislike'}`, error);
        } finally {
            target.disabled = false;
        }
    }
});

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
                    await addCommentToThread(threadId, { content });
                    const updatedThread = await getThreadById(threadId);
                    renderThreadDetail(updatedThread);
                    showToast('Komentar berhasil ditambahkan!', 'success');
                } catch (error) {
                    showError('menambahkan komentar', error);
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Kirim Komentar';
                    }
                }
            }
        });

        try {
            threadContainer.innerHTML = `<div class="loading-spinner"></div>`;
            const threadData = await getThreadById(threadId);
            renderThreadDetail(threadData);
        } catch (error) {
            showError('memuat detail thread', error);
            threadContainer.innerHTML = `<div class="empty-state"><p>Gagal memuat thread.</p></div>`;
        }
        // -- AKHIR DARI SEMUA LOGIKA HALAMAN --
    }
});