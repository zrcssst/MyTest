// js/api.js

const API_DELAY = 400;
const THREADS_PER_PAGE = 10;

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
        // Buat lebih banyak data dummy untuk paginasi
        const moreMockThreads = Array.from({ length: 25 }, (_, i) => ({
            id: `t${i + 2}`,
            title: `Ini adalah Judul Thread Ke-${i + 2} tentang Topik Menarik`,
            author: ['Budi', 'Citra', 'Eka', 'Dian'][i % 4],
            category: ['teknologi', 'edukasi', 'hobi', 'umum'][i % 4],
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            views: 10 + (i * 15),
            likes: 5 + (i * 3),
            dislikes: i % 5,
            commentsCount: i % 6,
            comments: []
        }));
        localStorage.setItem('threads', JSON.stringify([...mockThreads, ...moreMockThreads]));
    }
}
initializeData();

// --- Fungsi Helper Internal ---
const getAllThreadsFromStorage = () => JSON.parse(localStorage.getItem('threads')) || [];
const saveAllThreadsToStorage = (threads) => localStorage.setItem('threads', JSON.stringify(threads));

// --- Fungsi Ekspor ---
export const login = (name) => { if (!name) return; sessionStorage.setItem('currentUser', JSON.stringify({ name })); };
export const logout = () => { sessionStorage.removeItem('currentUser'); window.location.href = 'login.html'; };
export const getCurrentUser = () => { const user = sessionStorage.getItem('currentUser'); return user ? JSON.parse(user) : null; };

// DIPERBARUI: Mendukung paginasi
export const getThreads = ({ page = 1, limit = THREADS_PER_PAGE } = {}) => new Promise(resolve => {
    setTimeout(() => {
        const allThreads = getAllThreadsFromStorage();
        const totalThreads = allThreads.length;
        const totalPages = Math.ceil(totalThreads / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedThreads = allThreads.slice(startIndex, endIndex);
        
        resolve({
            threads: paginatedThreads,
            currentPage: page,
            totalPages: totalPages,
            totalThreads: totalThreads
        });
    }, API_DELAY);
});

// DIPERBARUI: Menggunakan helper
export const getAllThreads = () => new Promise(resolve => {
    setTimeout(() => {
        resolve(getAllThreadsFromStorage());
    }, API_DELAY);
});


export const getThreadById = (id) => new Promise((resolve, reject) => {
    setTimeout(() => {
        const threads = getAllThreadsFromStorage();
        const thread = threads.find(t => t.id === id);
        if (thread) {
            resolve(thread);
        } else {
            reject(new Error('Thread tidak ditemukan'));
        }
    }, 100);
});

export const saveNewThread = (thread) => new Promise(resolve => {
    setTimeout(() => {
        const threads = getAllThreadsFromStorage();
        thread.id = 't' + Date.now();
        threads.unshift(thread);
        saveAllThreadsToStorage(threads);
        resolve(thread);
    }, API_DELAY);
});

// DIPERBARUI: Menggunakan helper dan lebih robust
const updateThreadProperty = (threadId, updateFn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const threads = getAllThreadsFromStorage();
            const index = threads.findIndex(t => t.id === threadId);
            if (index !== -1) {
                const updatedThread = updateFn(threads[index]);
                threads[index] = updatedThread;
                saveAllThreadsToStorage(threads);
                resolve(updatedThread);
            } else {
                reject(new Error('Gagal memperbarui, thread tidak ditemukan.'));
            }
        }, 200);
    });
};

export const addLikeToThread = (threadId) => updateThreadProperty(threadId, (thread) => {
    thread.likes = (thread.likes || 0) + 1;
    return thread;
});

export const addDislikeToThread = (threadId) => updateThreadProperty(threadId, (thread) => {
    thread.dislikes = (thread.dislikes || 0) + 1;
    return thread;
});

export const incrementViewCount = (threadId) => updateThreadProperty(threadId, (thread) => {
    thread.views = (thread.views || 0) + 1;
    return thread;
});


// ... (Fungsi Komentar, Bookmark, Statistik, Profil tetap sama, hanya perlu ditambahkan 'export') ...
// Contoh:
export const addCommentToThread = (threadId, commentContent) => new Promise(resolve => { /* ... logika ... */ });
export const getBookmarks = () => JSON.parse(localStorage.getItem('bookmarks')) || [];
export const toggleBookmark = (threadId) => { /* ... logika ... */ };
export const isBookmarked = (threadId) => getBookmarks().includes(threadId);
export const getUserProfileData = (username) => new Promise(resolve => { /* ... logika ... */ });
// Dan seterusnya untuk semua fungsi yang perlu diakses dari luar.