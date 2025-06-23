// js/api.js

const API_DELAY = 400; 

// --- Inisialisasi & Data Mock ---
const mockThreads = [
    {
      id: 't1',
      title: 'Bagaimana cara terbaik belajar JavaScript di tahun 2025?',
      author: 'Budi Sanjaya',      // PASTIKAN PROPERTI INI ADA
      category: 'teknologi',      // PASTIKAN PROPERTI INI ADA
      timestamp: '2025-06-21T10:00:00Z', // PASTIKAN PROPERTI INI ADA
      views: 150,
      likes: 42,
      dislikes: 0,
      commentsCount: 2,           // PASTIKAN PROPERTI INI ADA
      comments: [
          { id: 'c1', author: 'Citra', content: 'Menurut saya React masih yang paling banyak dicari di industri...', timestamp: '2025-06-19T11:30:00Z', likes: 5, dislikes: 0 },
          { id: 'c2', author: 'Bunga', content: 'Kalau untuk pemula, Svelte bisa jadi pilihan yang menarik...', timestamp: '2025-06-19T12:00:00Z', likes: 3, dislikes: 1 }
      ]
    },
];

const MOCK_USERS_COUNT = 15;

function initializeData() {
    if (!localStorage.getItem('threads')) {
        localStorage.setItem('threads', JSON.stringify(mockThreads));
    }
}
initializeData(); 

// --- Fungsi Otentikasi (Tetap Sinkron) ---
function login(name) { if (!name) return; sessionStorage.setItem('currentUser', JSON.stringify({ name })); }
function logout() { sessionStorage.removeItem('currentUser'); window.location.href = 'login.html'; }
function getCurrentUser() { const user = sessionStorage.getItem('currentUser'); return user ? JSON.parse(user) : null; }

// --- API Threads (Asinkron) ---
const getThreads = () => new Promise(resolve => setTimeout(() => resolve(JSON.parse(localStorage.getItem('threads')) || []), API_DELAY));
const getThreadById = async (id) => {
    const threads = await getThreads();
    await new Promise(resolve => setTimeout(resolve, 100)); 
    return threads.find(t => t.id === id);
};
const saveNewThread = (thread) => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { thread.id = 't' + Date.now(); threads.unshift(thread); localStorage.setItem('threads', JSON.stringify(threads)); resolve(thread); }); }, API_DELAY));
const addLikeToThread = (threadId) => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { const i=threads.findIndex(t=>t.id===threadId); if(i!==-1){ threads[i].likes++; localStorage.setItem('threads',JSON.stringify(threads)); resolve(threads[i].likes); } else { resolve(null); } }); }, 200));
const addDislikeToThread = (threadId) => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { const i=threads.findIndex(t=>t.id===threadId); if(i!==-1){ threads[i].dislikes = (threads[i].dislikes || 0) + 1; localStorage.setItem('threads',JSON.stringify(threads)); resolve(threads[i].dislikes); } else { resolve(null); } }); }, 200));
const addCommentToThread = (threadId, commentContent) => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { const i = threads.findIndex(t => t.id === threadId); if (i !== -1) { if (!Array.isArray(threads[i].comments)) { threads[i].comments = []; } const c = { id: 'c' + Date.now(), author: getCurrentUser().name, content: commentContent, timestamp: new Date().toISOString(), likes: 0, dislikes: 0 }; threads[i].comments.push(c); threads[i].commentsCount = threads[i].comments.length; localStorage.setItem('threads', JSON.stringify(threads)); resolve(threads[i]); } else { resolve(null); } }); }, API_DELAY));
const addLikeToComment = (threadId, commentId) => new Promise(resolve => {
    getThreads().then(threads => {
        const thread = threads.find(t => t.id === threadId);
        if (thread) {
            const comment = thread.comments.find(c => c.id === commentId);
            if (comment) {
                comment.likes = (comment.likes || 0) + 1;
                localStorage.setItem('threads', JSON.stringify(threads));
                resolve(comment);
            } else { resolve(null); }
        } else { resolve(null); }
    });
});

const addDislikeToComment = (threadId, commentId) => new Promise(resolve => {
    getThreads().then(threads => {
        const thread = threads.find(t => t.id === threadId);
        if (thread) {
            const comment = thread.comments.find(c => c.id === commentId);
            if (comment) {
                comment.dislikes = (comment.dislikes || 0) + 1;
                localStorage.setItem('threads', JSON.stringify(threads));
                resolve(comment);
            } else { resolve(null); }
        } else { resolve(null); }
    });
});

const incrementViewCount = (threadId) => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { const i=threads.findIndex(t=>t.id===threadId); if(i!==-1){ threads[i].views=(threads[i].views||0)+1; localStorage.setItem('threads',JSON.stringify(threads)); } resolve(); }); }, 50));

// --- API Bookmark (Sinkron & Cepat, tidak perlu Promise) ---
const getBookmarks = () => JSON.parse(localStorage.getItem('bookmarks')) || [];
const toggleBookmark = (threadId) => { let b = getBookmarks(); const i=b.indexOf(threadId); if(i===-1){b.push(threadId);}else{b.splice(i,1);} localStorage.setItem('bookmarks',JSON.stringify(b)); return i===-1; };
const isBookmarked = (threadId) => getBookmarks().includes(threadId);

// --- API Statistik & Profil (Asinkron) ---
const getForumStats = () => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { const comments=threads.reduce((s,th)=>s+th.commentsCount,0); resolve({threads:threads.length,comments:comments,users:MOCK_USERS_COUNT}); }); }, 200));
const getUserProfileData = (username) => new Promise(resolve => setTimeout(() => { getThreads().then(allThreads => { const userThreads = allThreads.filter(t => t.author === username); let commentCount = 0; allThreads.forEach(thread => { if (thread.comments && Array.isArray(thread.comments)) { commentCount += thread.comments.filter(c => c.author === username).length; } }); const likesReceived = userThreads.reduce((total, thread) => total + thread.likes, 0); resolve({ name: username, threadCount: userThreads.length, commentCount: commentCount, likesReceived: likesReceived, threads: userThreads }); }); }, API_DELAY));
const getNotifications = () => new Promise(resolve => setTimeout(() => { getThreads().then(allThreads => { const currentUser = getCurrentUser(); let notifications = []; if (!currentUser) { resolve([{ id: 1, message: 'Selamat datang! Silakan login untuk berinteraksi.' }]); return; } notifications.push({ id: 'welcome', message: `Selamat datang kembali, ${currentUser.name}! Siap berdiskusi hari ini?` }); const userThreads = allThreads.filter(t => t.author === currentUser.name); userThreads.forEach(thread => { if (thread.comments && thread.comments.length > 0) { const lastComment = thread.comments[thread.comments.length - 1]; if (lastComment.author !== currentUser.name) { notifications.push({ id: `notif-comment-${thread.id}`, message: `<strong>${lastComment.author}</strong> berkomentar di thread Anda: "${thread.title.substring(0, 20)}..."` }); } } if (thread.likes > 10) { notifications.push({ id: `notif-like-${thread.id}`, message: `Thread Anda "${thread.title.substring(0, 20)}..." populer!` }); } }); resolve(notifications.slice(0, 4)); }); }, API_DELAY + 100));