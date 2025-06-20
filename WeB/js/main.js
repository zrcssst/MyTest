// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const isBookmarkPage = window.location.pathname.includes('bookmark.html');
    const threadListContainer = document.getElementById('thread-list-container');
    const searchInput = document.getElementById('searchInput');
    const pageTitle = document.getElementById('page-title');
    let state = { sort: 'terbaru', category: 'all' };

    const renderLoadingSkeletons = () => {
        threadListContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const card = document.createElement('div');
            card.className = 'skeleton-card';
            card.innerHTML = `<div class="skeleton title"></div><div class="skeleton text"></div><div class="skeleton text" style="width: 80%;"></div>`;
            threadListContainer.appendChild(card);
        }
    };

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
        statsDiv.innerHTML = `
            <span><i class="fa-regular fa-eye"></i> ${thread.views || 0}</span>
            <span><i class="fa-regular fa-thumbs-up"></i> ${thread.likes}</span>
            <span><i class="fa-regular fa-comment"></i> ${thread.commentsCount}</span>
            <span class="thread-card__tag thread-card__tag--${thread.category}">${thread.category}</span>`;

        card.append(titleLink, metaDiv, statsDiv);
        return card;
    };

    const renderThreads = (keyword = '') => {
        let threads = isBookmarkPage ? getThreads().filter(t => getBookmarks().includes(t.id)) : getThreads();
        if (!isBookmarkPage && state.category !== 'all') { threads = threads.filter(t => t.category === state.category); }
        if (keyword) { threads = threads.filter(t => t.title.toLowerCase().includes(keyword)); }
        
        threads.sort((a, b) => {
            if (state.sort === 'populer') return b.likes - a.likes;
            if (state.sort === 'trending') return ((b.likes * 2) + b.commentsCount + (b.views / 10)) - ((a.likes * 2) + a.commentsCount + (a.views / 10));
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        threadListContainer.innerHTML = '';
        if (threads.length === 0) {
            renderEmptyState(isBookmarkPage ? 'Anda belum menyimpan bookmark.' : 'Tidak ada thread yang cocok.');
            return;
        }
        threads.forEach(thread => threadListContainer.appendChild(createThreadCard(thread)));
    };

    const debouncedRender = debounce((e) => renderThreads(e.target.value.toLowerCase()), 500);
    
    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            renderLoadingSkeletons();
            debouncedRender(e);
        });
    }

    if (!isBookmarkPage) {
        const sortingOptions = document.querySelector('.sorting-options');
        sortingOptions.addEventListener('click', (e) => {
            if (e.target.matches('.sort-btn')) {
                state.sort = e.target.dataset.sort;
                document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderThreads(searchInput.value);
            }
        });
        const categoryList = document.querySelector('.category-list');
        categoryList.addEventListener('click', (e) => {
            if (e.target.matches('.category-link')) {
                e.preventDefault();
                state.category = e.target.dataset.category;
                pageTitle.textContent = state.category === 'all' ? 'Diskusi Terkini' : `Kategori: ${state.category.charAt(0).toUpperCase() + state.category.slice(1)}`;
                document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
                e.target.classList.add('active');
                renderThreads(searchInput.value);
            }
        });
    }

    function showNotification() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('status') === 'thread_created') {
            const banner = document.getElementById('notification-banner');
            banner.textContent = 'Thread baru berhasil dipublikasikan!';
            banner.classList.add('show');
            setTimeout(() => { banner.classList.remove('show'); window.history.replaceState({}, document.title, window.location.pathname); }, 4000);
        }
    }

    renderThreads();
    renderStats();
    showNotification();
});