// js/thread-detail.js
document.addEventListener('DOMContentLoaded', () => {
    const threadContainer = document.getElementById('thread-detail-container');
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get('id');

    if (!threadId) { threadContainer.innerHTML = '<p class="error-message">Error: ID thread tidak ditemukan.</p>'; return; }

    incrementViewCount(threadId);
    const thread = getThreadById(threadId);
    if (!thread) { threadContainer.innerHTML = '<p class="error-message">Thread tidak ditemukan.</p>'; return; }
    
    renderThreadDetail(thread);

    threadContainer.addEventListener('click', function(event) {
        const likeButton = event.target.closest('.like-btn');
        if (likeButton) { const newLikes = addLikeToThread(threadId); if (newLikes !== null) { likeButton.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> Suka (${newLikes})`; likeButton.classList.add('active'); } }
        const bookmarkButton = event.target.closest('.bookmark-btn');
        if (bookmarkButton) { const bookmarked = toggleBookmark(threadId); updateBookmarkButton(bookmarkButton, bookmarked); }
        if (event.target.matches('.comment-form button')) {
            event.preventDefault();
            const textarea = threadContainer.querySelector('.comment-form textarea');
            const commentText = textarea.value.trim();
            if (commentText) { const sanitizedComment = DOMPurify.sanitize(commentText); const updatedThread = addCommentToThread(threadId, sanitizedComment); if (updatedThread) { renderThreadDetail(updatedThread); } }
        }
    });

    function updateBookmarkButton(button, isBookmarkedStatus) {
        button.innerHTML = isBookmarkedStatus ? `<i class="fa-solid fa-bookmark"></i> Disimpan` : `<i class="fa-regular fa-bookmark"></i> Bookmark`;
        button.classList.toggle('active', isBookmarkedStatus);
    }

    function renderThreadDetail(threadData) {
        document.title = `${threadData.title} - ForumKita`;
        const sanitizedContent = DOMPurify.sanitize(threadData.content, { USE_PROFILES: { html: true } });
        threadContainer.innerHTML = `
            <article class="thread-full">
                <h1 class="thread-full__title">${threadData.title}</h1>
                <div class="thread-card__meta"><span>Oleh <strong>${threadData.author}</strong></span> • <time>${new Date(threadData.timestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</time></div>
                <div class="thread-full__content">${sanitizedContent}</div>
                <div class="thread-full__actions">
                    <button class="btn-action like-btn"><i class="fa-regular fa-thumbs-up"></i> Suka (${threadData.likes})</button>
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
        return comments.slice().reverse().map(comment => `
            <div class="comment">
                <div class="comment__header"><strong>${comment.author}</strong><time>${formatDisplayDate(comment.timestamp)}</time></div>
                <div class="comment__content"><p>${comment.content}</p></div>
            </div>`).join('');
    }
});