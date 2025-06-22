// js/api.js
const mockThreads = [
    { id: 't1', title: 'Bagaimana cara terbaik belajar JavaScript di tahun 2025?', content: 'Saya seorang pemula...', author: 'Andi', timestamp: '2025-06-19T10:00:00Z', category: 'teknologi', commentsCount: 2, likes: 42, views: 150, comments: [ { id: 'c1', author: 'Citra', content: 'Menurut saya React masih yang paling banyak dicari di industri.', timestamp: '2025-06-19T11:30:00Z' }, { id: 'c2', author: 'Bunga', content: 'Svelte bisa jadi pilihan.', timestamp: '2025-06-19T12:00:00Z' } ] },
    { id: 't2', title: 'Rekomendasi buku fiksi ilmiah yang wajib dibaca', content: 'Baru saja selesai membaca "Dune"...', author: 'Bunga', timestamp: '2025-06-18T14:30:00Z', category: 'hobi', commentsCount: 0, likes: 25, views: 98, comments: [] },
    { id: 't3', title: 'Tips & Trik Optimasi Performa Website', content: 'Mari berbagi teknik favorit kalian...', author: 'Citra', timestamp: '2025-06-17T09:00:00Z', category: 'edukasi', commentsCount: 0, likes: 58, views: 250, comments: [] }
];
const MOCK_USERS_COUNT = 15;
function login(name) { if (!name) return; sessionStorage.setItem('currentUser', JSON.stringify({ name })); }
function logout() { sessionStorage.removeItem('currentUser'); window.location.href = 'login.html'; }
function getCurrentUser() { const user = sessionStorage.getItem('currentUser'); return user ? JSON.parse(user) : null; }
function initializeData() { if (!localStorage.getItem('threads')) { localStorage.setItem('threads', JSON.stringify(mockThreads)); } }
function getThreads() { return JSON.parse(localStorage.getItem('threads')) || []; }
function getThreadById(id) { return getThreads().find(thread => thread.id === id); }
function saveNewThread(thread) { const threads = getThreads(); thread.id = 't' + Date.now(); threads.unshift(thread); localStorage.setItem('threads', JSON.stringify(threads)); }
function addLikeToThread(threadId) { const threads = getThreads(); const i = threads.findIndex(t=>t.id===threadId); if(i!==-1){ threads[i].likes++; localStorage.setItem('threads',JSON.stringify(threads)); return threads[i].likes; } return null; }
function addCommentToThread(threadId, commentContent) { const threads = getThreads(); const i = threads.findIndex(t => t.id === threadId); if (i !== -1) { if (!Array.isArray(threads[i].comments)) { threads[i].comments = []; } const user = getCurrentUser(); const c = { id: 'c' + Date.now(), author: user.name, content: commentContent, timestamp: new Date().toISOString() }; threads[i].comments.push(c); threads[i].commentsCount = threads[i].comments.length; localStorage.setItem('threads', JSON.stringify(threads)); return threads[i]; } return null; }
function incrementViewCount(threadId) { const threads = getThreads(); const i = threads.findIndex(t=>t.id===threadId); if(i!==-1){ threads[i].views=(threads[i].views||0)+1; localStorage.setItem('threads',JSON.stringify(threads)); } }
function getBookmarks() { return JSON.parse(localStorage.getItem('bookmarks')) || []; }
function toggleBookmark(threadId) { let b = getBookmarks(); const i=b.indexOf(threadId); if(i===-1){b.push(threadId);}else{b.splice(i,1);} localStorage.setItem('bookmarks',JSON.stringify(b)); return i===-1; }
function isBookmarked(threadId) { return getBookmarks().includes(threadId); }
function getForumStats() { const t = getThreads(); const c=t.reduce((s,th)=>s+th.commentsCount,0); return {threads:t.length,comments:c,users:MOCK_USERS_COUNT};}

/**
 * **[BARU]** Fungsi untuk mengambil data profil pengguna.
 * Menghitung jumlah thread, komentar, dan total suka yang diterima oleh pengguna.
 */
function getUserProfileData(username) {
    const allThreads = getThreads();
    const userThreads = allThreads.filter(t => t.author === username);
    
    let commentCount = 0;
    allThreads.forEach(thread => {
        if (thread.comments && Array.isArray(thread.comments)) {
            commentCount += thread.comments.filter(c => c.author === username).length;
        }
    });

    const likesReceived = userThreads.reduce((total, thread) => total + thread.likes, 0);

    return {
        name: username,
        threadCount: userThreads.length,
        commentCount: commentCount,
        likesReceived: likesReceived,
        threads: userThreads // Mengembalikan juga daftar thread yang dibuat
    };
}

/**
 * **[BARU]** Fungsi untuk mengambil notifikasi (simulasi).
 */
function getNotifications() {
    // Ini adalah data simulasi, di dunia nyata ini akan berasal dari server.
    return [
        { id: 1, message: 'Bunga berkomentar di thread "Rekomendasi buku...".' },
        { id: 2, message: 'Thread Anda "Tips & Trik Optimasi" mendapatkan suka baru.' },
        { id: 3, message: 'Selamat datang di ForumKita! Jangan ragu untuk memulai diskusi.' }
    ];
}

initializeData();