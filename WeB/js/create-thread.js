// WeB/js/thread-detail.js (Versi Final dengan DOM API Penuh)

import { getThreadById, addCommentToThread, getCurrentUser, addLikeToThread, addDislikeToThread } from './api.js';
import { formatDisplayDate } from './utils.js';
import { loadLayout } from './layout.js';
import { showToast, showError } from './ui.js';

async function initializePage() {
    await loadLayout();
    const threadContainer = document.getElementById('thread-detail-container');
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get('id');

    if (!threadId) {
        threadContainer.innerHTML = '<p class="error-message">Error: ID thread tidak ditemukan.</p>';
        return;
    }

    // [REVISI FINAL] Fungsi render sekarang membangun setiap elemen secara manual
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

        // --- INI BAGIAN UTAMA PERBAIKAN ---
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'thread-full__actions';

        // Buat Tombol Like
        const likeBtn = document.createElement('button');
        likeBtn.className = 'btn-action';
        likeBtn.id = 'like-btn';
        likeBtn.dataset.threadId = threadData.id;
        likeBtn.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> Suka`;
        
        // Buat Skor Like
        const likeScore = document.createElement('span');
        likeScore.className = 'vote-score';
        likeScore.textContent = threadData.likes || 0;

        // Buat Tombol Dislike
        const dislikeBtn = document.createElement('button');
        dislikeBtn.className = 'btn-action';
        dislikeBtn.id = 'dislike-btn';
        dislikeBtn.dataset.threadId = threadData.id;
        dislikeBtn.innerHTML = `<i class="fa-regular fa-thumbs-down"></i> Tidak Suka`;

        // Buat Skor Dislike
        const dislikeScore = document.createElement('span');
        dislikeScore.className = 'vote-score';
        dislikeScore.textContent = threadData.dislikes || 0;

        // Gabungkan semua ke dalam actionsDiv
        actionsDiv.appendChild(likeBtn);
        actionsDiv.appendChild(likeScore);
        actionsDiv.appendChild(dislikeBtn);
        actionsDiv.appendChild(dislikeScore);
        
        article.appendChild(actionsDiv);
        // --- AKHIR BAGIAN PERBAIKAN ---

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
        
        threadContainer.appendChild(article);
        threadContainer.appendChild(commentsSection);
    }

    // Sisa kode di bawah ini tidak berubah...
    function renderComments(comments) {
        if (!comments || comments.length === 0) return '<p style="text-align:center; padding: 2rem; color: var(--text-secondary);">Jadilah yang pertama berkomentar!</p>';
        return comments.map(comment => `<div class="comment"><div class="comment__header"><strong>${comment.author.name}</strong><time>${formatDisplayDate(comment.createdAt)}</time></div><div class="comment__content"><p>${DOMPurify.sanitize(comment.content)}</p></div></div>`).join('');
    }

    threadContainer.addEventListener('click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        if (target.id === 'like-btn' || target.id === 'dislike-btn') {
            const currentThreadId = target.dataset.threadId;
            target.disabled = true;
            try {
                let updatedThread = target.id === 'like-btn' ? await addLikeToThread(currentThreadId) : await addDislikeToThread(currentThreadId);
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
            if (!content) { showToast('Komentar tidak boleh kosong.', 'error'); return; }
            submitButton.disabled = true;
            submitButton.textContent = 'Mengirim...';
            try {
                await addCommentToThread(threadId, { content });
                const updatedThread = await getThreadById(threadId);
                renderThreadDetail(updatedThread);
                showToast('Komentar berhasil ditambahkan!', 'success');
            } catch (error) {
                showError('menambahkan komentar', error);
                if (form.querySelector('button[type="submit"]')) {
                    form.querySelector('button[type="submit"]').disabled = false;
                    form.querySelector('button[type="submit"]').textContent = 'Kirim Komentar';
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
}

document.addEventListener('DOMContentLoaded', initializePage);