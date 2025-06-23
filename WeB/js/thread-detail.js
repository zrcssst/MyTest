// js/thread-detail.js
import { getThreadById, addLikeToThread, addDislikeToThread, toggleBookmark, isBookmarked, addCommentToThread } from './api.js';
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

    let currentThread;


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
                    <button class="btn-action like-btn"><i class="fa-regular fa-thumbs-up"></i></button>
                    <span class="vote-score">${voteScore}</span>
                    <button class="btn-action dislike-btn"><i class="fa-regular fa-thumbs-down"></i></button>
                    <button class="btn-action bookmark-btn"></button>
                    <button class="btn-action"><i class="fa-regular fa-flag"></i> Report</button>
                </div>
            </article>
            <section class="comments-section">
                <h2>${threadData.commentsCount} Komentar</h2>
                <form class="comment-form"><textarea placeholder="Tulis komentarmu..." rows="4"></textarea><button type="submit" class="btn btn--primary">Kirim Komentar</button></form>
                <div class="comments-list">${renderComments(threadData.comments)}</div>
            </section>`;
        updateBookmarkButton(threadContainer.querySelector('.bookmark-btn'), isBookmarked(threadId));
    }

  function renderComments(comments) {
        if (!comments || comments.length === 0) { return '<p>Jadilah yang pertama berkomentar!</p>'; }
        return comments.slice().reverse().map(comment => {
            const voteScore = (comment.likes || 0) - (comment.dislikes || 0);
            return `
            <div class="comment">
                <div class="comment__header">
                    <strong>${comment.author}</strong>
                    <time>${formatDisplayDate(comment.timestamp)}</time>
                </div>
                <div class="comment__content"><p>${comment.content}</p></div>
                <div class="comment__actions">
                    <button class="btn-action comment-like-btn" data-comment-id="${comment.id}"><i class="fa-regular fa-thumbs-up"></i></button>
                    <span class="comment-vote-score">${voteScore}</span>
                    <button class="btn-action comment-dislike-btn" data-comment-id="${comment.id}"><i class="fa-regular fa-thumbs-down"></i></button>
                </div>
            </div>`;
        }).join('');
    }
     threadContainer.addEventListener('click', async (event) => {
        const likeButton = event.target.closest('.like-btn');
        const bookmarkButton = event.target.closest('.bookmark-btn');

        // Optimistic Like
        if (likeButton) {
            const scoreElement = threadContainer.querySelector('.vote-score');
            const originalLikes = currentThread.likes;
            const originalScore = (originalLikes || 0) - (currentThread.dislikes || 0);
            
            // 1. Update UI secara instan
            likeButton.classList.add('active');
            likeButton.disabled = true;
            currentThread.likes++;
            scoreElement.textContent = originalScore + 1;

            try {
                // 2. Panggil API di latar belakang
                await addLikeToThread(threadId);
                showToast('Thread disukai!');
            } catch (error) {
                // 3. Rollback jika gagal
                currentThread.likes = originalLikes;
                scoreElement.textContent = originalScore;
                likeButton.classList.remove('active');
                showError('menyukai thread', error);
            } finally {
                likeButton.disabled = false;
            }
        }

        // Optimistic Bookmark
        if (bookmarkButton) {
            const wasBookmarked = bookmarkButton.classList.contains('active');
            
            // 1. Update UI secara instan
            updateBookmarkButton(bookmarkButton, !wasBookmarked);

            try {
                // 2. Panggil API (sinkron di kasus ini)
                toggleBookmark(threadId);
                showToast(!wasBookmarked ? 'Bookmark ditambahkan' : 'Bookmark dihapus');
            } catch (error) {
                // 3. Rollback jika gagal (meskipun toggleBookmark sinkron)
                updateBookmarkButton(bookmarkButton, wasBookmarked);
                showError('menyimpan bookmark', error);
            }
        }
        
        // ... (logika untuk dislike, komentar, dll.)
    });

    // Inisialisasi
    try {
        currentThread = await getThreadById(threadId);
        renderThreadDetail(currentThread);
    } catch (error) {
        showError('memuat detail thread', error);
        threadContainer.innerHTML = `<p class="error-message">Gagal memuat thread. Mungkin thread telah dihapus.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', initializePage);