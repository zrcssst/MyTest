// js/main.js (Versi Perbaikan)
document.addEventListener('DOMContentLoaded', () => {
    const threadListContainer = document.getElementById('thread-list-container');
    const searchInput = document.getElementById('searchInput');
    const pageTitle = document.getElementById('page-title');
    
    let allThreads = []; 
    let state = { sort: 'terbaru', category: 'all' };

    const debouncedRender = debounce((keyword) => {
        renderThreads(keyword);
    }, 400); 
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        debouncedRender(query);
    });
    
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

    // Fungsi render sekarang hanya memanipulasi data yang sudah ada (allThreads)
    const renderThreads = (keyword = '') => {
        // Logika render sekarang lebih sederhana
        let threadsToRender = [...allThreads];

        if (state.category !== 'all') {
            threadsToRender = threadsToRender.filter(t => t.category === state.category);
        }
        if (keyword) {
            threadsToRender = threadsToRender.filter(t => t.title.toLowerCase().includes(keyword));
        }

        threadsToRender.sort((a, b) => {
            if (state.sort === 'populer') return b.likes - a.likes;
            if (state.sort === 'trending') return ((b.likes * 2) + b.commentsCount + (b.views / 10)) - ((a.likes * 2) + a.commentsCount + (a.views / 10));
            return new Date(b.timestamp) - new Date(b.timestamp);
        });

        threadListContainer.innerHTML = '';
        if (threadsToRender.length === 0) {
            renderEmptyState('Tidak ada thread yang cocok.');
            return;
        }
        threadsToRender.forEach(thread => threadListContainer.appendChild(createThreadCard(thread)));
    };
    
        const sortingOptions = document.querySelector('.sorting-options');
        sortingOptions.addEventListener('click', (e) => {
            if (e.target.matches('.sort-btn')) {
                state.sort = e.target.dataset.sort;
                document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderThreads(searchInput.value.toLowerCase().trim()); // Panggil render tanpa await
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
                renderThreads(searchInput.value.toLowerCase().trim()); // Panggil render tanpa await
            }
        });
    

    const renderStats = async () => {
        if (isBookmarkPage || !document.getElementById('stats-threads')) return;
        const stats = await getForumStats();
        document.getElementById('stats-threads').textContent = `Threads: ${stats.threads}`;
        document.getElementById('stats-comments').textContent = `Komentar: ${stats.comments}`;
        document.getElementById('stats-users').textContent = `Pengguna: ${stats.users}`;
    };

    const showNotification = () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('status') === 'thread_created') {
            const banner = document.getElementById('notification-banner');
            banner.textContent = 'Thread baru berhasil dipublikasikan!';
            banner.classList.add('show');
            setTimeout(() => {
                banner.classList.remove('show');
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 4000);
        }
    };

    const initializePage = async () => {
        renderLoadingSkeletons();
        showNotification();
        
        // Ambil semua data sekali dan simpan
        allThreads = await getThreads();
        
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');

        if (searchQuery) {
            searchInput.value = searchQuery;
        }
        
        // Render pertama kali
        renderThreads(searchQuery ? searchQuery.toLowerCase() : '');
        
        // Render statistik
        await renderStats();
    };

    initializePage();
});