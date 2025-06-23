// js/bookmark.js
document.addEventListener('DOMContentLoaded', async () => {
    const threadListContainer = document.getElementById('thread-list-container');

    const renderEmptyState = (message) => {
        threadListContainer.innerHTML = `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><p>${message}</p></div>`;
    };

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

    const renderBookmarkedThreads = (threads) => {
        threadListContainer.innerHTML = '';
        if (threads.length === 0) {
            renderEmptyState('Anda belum menyimpan bookmark.');
            return;
        }
        threads.forEach(thread => threadListContainer.appendChild(createThreadCard(thread)));
    };
    
    const initializeBookmarkPage = async () => {
        threadListContainer.innerHTML = ''; // Tampilkan loading jika perlu
        const allThreads = await getThreads();
        const bookmarkedIds = getBookmarks();
        const bookmarkedThreads = allThreads.filter(t => bookmarkedIds.includes(t.id));
        
        renderBookmarkedThreads(bookmarkedThreads);
    };

    initializeBookmarkPage();
});