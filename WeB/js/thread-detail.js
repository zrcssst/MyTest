// js/thread-detail.js
document.addEventListener('DOMContentLoaded', async () => { 
    const threadContainer = document.getElementById('thread-detail-container');
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get('id');

    if (!threadId) { threadContainer.innerHTML = '<p class="error-message">Error: ID thread tidak ditemukan.</p>'; return; }

     await incrementViewCount(threadId);
    let thread = await getThreadById(threadId);
    if (!thread) { threadContainer.innerHTML = '<p class="error-message">Thread tidak ditemukan.</p>'; return; }
    
    renderThreadDetail(thread);

    threadContainer.addEventListener('click', async function(event) {
        const likeButton = event.target.closest('.like-btn');
        if (likeButton) {
            likeButton.disabled = true;
            likeButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
            const newLikes = await addLikeToThread(threadId);
            if (newLikes !== null) {
                const thread = await getThreadById(threadId); 
                renderThreadDetail(thread); 
            }
            likeButton.disabled = false;
        }
        const dislikeButton = event.target.closest('.dislike-btn');
        if (dislikeButton) {
            dislikeButton.disabled = true;
            dislikeButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
            const newDislikes = await addDislikeToThread(threadId);
            if (newDislikes !== null) {
                const thread = await getThreadById(threadId); 
                renderThreadDetail(thread);
            }
            dislikeButton.disabled = false;
        }
         const commentLikeBtn = event.target.closest('.comment-like-btn');
        if (commentLikeBtn) {
            const commentId = commentLikeBtn.dataset.commentId;
            await addLikeToComment(threadId, commentId);
            thread = await getThreadById(threadId); // Ambil data terbaru
            renderThreadDetail(thread); // Render ulang
        }

        // [BARU] Logika untuk Dislike Komentar
        const commentDislikeBtn = event.target.closest('.comment-dislike-btn');
        if (commentDislikeBtn) {
            const commentId = commentDislikeBtn.dataset.commentId;
            await addDislikeToComment(threadId, commentId);
            thread = await getThreadById(threadId); // Ambil data terbaru
            renderThreadDetail(thread); // Render ulang
        }
        const bookmarkButton = event.target.closest('.bookmark-btn');
        if (bookmarkButton) {
            const bookmarked = toggleBookmark(threadId); // Ini tetap sinkron
            updateBookmarkButton(bookmarkButton, bookmarked); 
        }

        if (event.target.matches('.comment-form button')) {
            event.preventDefault();
            const textarea = threadContainer.querySelector('.comment-form textarea');
            const commentText = textarea.value.trim();
            if (commentText) { 
                const sanitizedComment = DOMPurify.sanitize(commentText); 
                const updatedThread = await addCommentToThread(threadId, sanitizedComment); // Menggunakan await
                if (updatedThread) { 
                    renderThreadDetail(updatedThread); 
                }
            }
        }
    });
    function updateBookmarkButton(button, isBookmarkedStatus) {
        button.innerHTML = isBookmarkedStatus ? `<i class="fa-solid fa-bookmark"></i> Disimpan` : `<i class="fa-regular fa-bookmark"></i> Bookmark`;
        button.classList.toggle('active', isBookmarkedStatus);
    }

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
});