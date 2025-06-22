// js/api.js

const API_DELAY = 400; // Jeda waktu simulasi jaringan dalam milidetik

// --- Inisialisasi & Data Mock ---
const mockThreads = [
    { id: 't1', title: 'Bagaimana cara terbaik belajar JavaScript di tahun 2025?', content: 'Saya seorang pemula yang ingin memulai karier di bidang web development. Melihat perkembangan yang begitu pesat, framework dan library apa yang sebaiknya saya pelajari terlebih dahulu? Apakah fokus ke React, Vue, atau mencoba Svelte?', author: 'Andi', timestamp: '2025-06-19T10:00:00Z', category: 'teknologi', commentsCount: 2, likes: 42, views: 150, comments: [ { id: 'c1', author: 'Citra', content: 'Menurut saya React masih yang paling banyak dicari di industri. Banyak perusahaan besar menggunakannya, jadi pasarnya lebih luas.', timestamp: '2025-06-19T11:30:00Z' }, { id: 'c2', author: 'Bunga', content: 'Kalau untuk pemula, Svelte bisa jadi pilihan yang menarik karena sintaksnya lebih sederhana dan lebih dekat ke HTML/CSS/JS standar.', timestamp: '2025-06-19T12:00:00Z' } ] },
    { id: 't2', title: 'Rekomendasi buku fiksi ilmiah yang wajib dibaca', content: 'Baru saja selesai membaca "Dune" dan sangat terkesan. Adakah rekomendasi buku sci-fi lain dengan pembangunan dunia yang epik seperti itu? Saya suka tema politik, teknologi, dan eksplorasi luar angkasa.', author: 'Bunga', timestamp: '2025-06-18T14:30:00Z', category: 'hobi', commentsCount: 0, likes: 25, views: 98, comments: [] },
    { id: 't3', title: 'Tips & Trik Optimasi Performa Website', content: 'Mari berbagi teknik favorit kalian untuk membuat website lebih cepat. Mulai dari lazy loading gambar, code splitting, hingga optimasi font. Apa trik andalan kalian?', author: 'Citra', timestamp: '2025-06-17T09:00:00Z', category: 'edukasi', commentsCount: 0, likes: 58, views: 250, comments: [] }
];
const MOCK_USERS_COUNT = 15;

function initializeData() {
    if (!localStorage.getItem('threads')) {
        localStorage.setItem('threads', JSON.stringify(mockThreads));
    }
}
initializeData(); // Panggil saat skrip dimuat

// --- Fungsi Otentikasi (Tetap Sinkron) ---
function login(name) { if (!name) return; sessionStorage.setItem('currentUser', JSON.stringify({ name })); }
function logout() { sessionStorage.removeItem('currentUser'); window.location.href = 'login.html'; }
function getCurrentUser() { const user = sessionStorage.getItem('currentUser'); return user ? JSON.parse(user) : null; }

// --- API Threads (Asinkron) ---
const getThreads = () => new Promise(resolve => setTimeout(() => resolve(JSON.parse(localStorage.getItem('threads')) || []), API_DELAY));
const getThreadById = (id) => new Promise(resolve => setTimeout(() => resolve(getThreads().then(threads => threads.find(t => t.id === id))), 100));
const saveNewThread = (thread) => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { thread.id = 't' + Date.now(); threads.unshift(thread); localStorage.setItem('threads', JSON.stringify(threads)); resolve(thread); }); }, API_DELAY));
const addLikeToThread = (threadId) => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { const i=threads.findIndex(t=>t.id===threadId); if(i!==-1){ threads[i].likes++; localStorage.setItem('threads',JSON.stringify(threads)); resolve(threads[i].likes); } else { resolve(null); } }); }, 200));
const addCommentToThread = (threadId, commentContent) => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { const i = threads.findIndex(t => t.id === threadId); if (i !== -1) { if (!Array.isArray(threads[i].comments)) { threads[i].comments = []; } const c = { id: 'c' + Date.now(), author: getCurrentUser().name, content: commentContent, timestamp: new Date().toISOString() }; threads[i].comments.push(c); threads[i].commentsCount = threads[i].comments.length; localStorage.setItem('threads', JSON.stringify(threads)); resolve(threads[i]); } else { resolve(null); } }); }, API_DELAY));
const incrementViewCount = (threadId) => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { const i=threads.findIndex(t=>t.id===threadId); if(i!==-1){ threads[i].views=(threads[i].views||0)+1; localStorage.setItem('threads',JSON.stringify(threads)); } resolve(); }); }, 50));

// --- API Bookmark (Sinkron & Cepat, tidak perlu Promise) ---
const getBookmarks = () => JSON.parse(localStorage.getItem('bookmarks')) || [];
const toggleBookmark = (threadId) => { let b = getBookmarks(); const i=b.indexOf(threadId); if(i===-1){b.push(threadId);}else{b.splice(i,1);} localStorage.setItem('bookmarks',JSON.stringify(b)); return i===-1; };
const isBookmarked = (threadId) => getBookmarks().includes(threadId);

// --- API Statistik & Profil (Asinkron) ---
const getForumStats = () => new Promise(resolve => setTimeout(() => { getThreads().then(threads => { const comments=threads.reduce((s,th)=>s+th.commentsCount,0); resolve({threads:threads.length,comments:comments,users:MOCK_USERS_COUNT}); }); }, 200));
const getUserProfileData = (username) => new Promise(resolve => setTimeout(() => { getThreads().then(allThreads => { const userThreads = allThreads.filter(t => t.author === username); let commentCount = 0; allThreads.forEach(thread => { if (thread.comments && Array.isArray(thread.comments)) { commentCount += thread.comments.filter(c => c.author === username).length; } }); const likesReceived = userThreads.reduce((total, thread) => total + thread.likes, 0); resolve({ name: username, threadCount: userThreads.length, commentCount: commentCount, likesReceived: likesReceived, threads: userThreads }); }); }, API_DELAY));
const getNotifications = () => new Promise(resolve => setTimeout(() => { getThreads().then(allThreads => { const currentUser = getCurrentUser(); let notifications = []; if (!currentUser) { resolve([{ id: 1, message: 'Selamat datang! Silakan login untuk berinteraksi.' }]); return; } notifications.push({ id: 'welcome', message: `Selamat datang kembali, ${currentUser.name}! Siap berdiskusi hari ini?` }); const userThreads = allThreads.filter(t => t.author === currentUser.name); userThreads.forEach(thread => { if (thread.comments && thread.comments.length > 0) { const lastComment = thread.comments[thread.comments.length - 1]; if (lastComment.author !== currentUser.name) { notifications.push({ id: `notif-comment-${thread.id}`, message: `<strong>${lastComment.author}</strong> berkomentar di thread Anda: "${thread.title.substring(0, 20)}..."` }); } } if (thread.likes > 10) { notifications.push({ id: `notif-like-${thread.id}`, message: `Thread Anda "${thread.title.substring(0, 20)}..." populer!` }); } }); resolve(notifications.slice(0, 4)); }); }, API_DELAY + 100));