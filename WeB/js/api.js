// js/api.js

const API_DELAY = 400;
const THREADS_PER_PAGE = 10;

// --- Inisialisasi & Data Mock ---
const mockThreads = [
    {
      id: 't1',
      title: 'Bagaimana cara terbaik belajar JavaScript di tahun 2025?',
      author: 'Budi',
      category: 'teknologi',
      content: 'Saya seorang pemula yang ingin mendalami JavaScript. Banyak sekali framework dan library baru bermunculan. Apakah lebih baik fokus ke fundamental (vanilla JS) dulu, atau langsung loncat ke framework seperti React atau Vue? Mohon saran dari para senior.',
      timestamp: '2025-06-21T10:00:00Z',
      views: 150,
      likes: 42,
      dislikes: 2,
      commentsCount: 2,
      comments: [
          { id: 'c1', author: 'Citra', content: 'Menurut saya fundamental itu wajib. Kalau fundamental kuat, belajar framework apa pun jadi lebih mudah. Coba deh project-based learning pakai vanilla JS dulu.', timestamp: '2025-06-21T11:30:00Z', likes: 10, dislikes: 0 },
          { id: 'c2', author: 'Eka', content: 'Setuju dengan Citra. Tapi kalau tujuannya cepat dapat kerja, mungkin bisa pelajari dasar JS lalu langsung ke React karena permintaannya sangat tinggi di industri.', timestamp: '2025-06-21T12:00:00Z', likes: 7, dislikes: 1 }
      ]
    },
];

const MOCK_USERS_COUNT = 15;
const ALL_USERS = ['Budi', 'Citra', 'Eka', 'Dian', 'Fitri', 'Gilang', 'Hana', 'Indra'];

function initializeData() {
    if (!localStorage.getItem('threads')) {
        const moreMockThreads = Array.from({ length: 25 }, (_, i) => ({
            id: `t${i + 2}`,
            title: `Ini adalah Judul Thread Ke-${i + 2} tentang Topik Menarik`,
            author: ALL_USERS[i % ALL_USERS.length],
            category: ['teknologi', 'edukasi', 'hobi', 'umum'][i % 4],
            content: `Ini adalah konten contoh untuk thread ke-${i + 2}. Konten ini membahas tentang kategori ${['teknologi', 'edukasi', 'hobi', 'umum'][i % 4]} dan dibuat oleh ${ALL_USERS[i % ALL_USERS.length]}.`,
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            views: 10 + (i * 15),
            likes: 5 + (i * 3),
            dislikes: i % 5,
            commentsCount: Math.floor(Math.random() * 5),
            comments: []
        }));
        localStorage.setItem('threads', JSON.stringify([...mockThreads, ...moreMockThreads]));
    }
}
initializeData();

// --- Fungsi Helper Internal ---
const getAllThreadsFromStorage = () => JSON.parse(localStorage.getItem('threads')) || [];
const saveAllThreadsToStorage = (threads) => localStorage.setItem('threads', JSON.stringify(threads));

// --- Fungsi Otentikasi & Pengguna ---
export const login = (name) => { if (!name) return; sessionStorage.setItem('currentUser', JSON.stringify({ name })); };
export const logout = () => { sessionStorage.removeItem('currentUser'); window.location.href = 'login.html'; };
export const getCurrentUser = () => { const user = sessionStorage.getItem('currentUser'); return user ? JSON.parse(user) : null; };

// --- Fungsi Thread ---
export const getThreads = ({ page = 1, limit = THREADS_PER_PAGE } = {}) => new Promise(resolve => {
    setTimeout(() => {
        const allThreads = getAllThreadsFromStorage().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Selalu sort terbaru
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
        threads.unshift(thread); // Tambahkan ke awal array
        saveAllThreadsToStorage(threads);
        resolve(thread);
    }, API_DELAY);
});

const updateThreadProperty = (threadId, updateFn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const threads = getAllThreadsFromStorage();
            const index = threads.findIndex(t => t.id === threadId);
            if (index !== -1) {
                threads[index] = updateFn(threads[index]);
                saveAllThreadsToStorage(threads);
                resolve(threads[index]);
            } else {
                reject(new Error('Gagal memperbarui, thread tidak ditemukan.'));
            }
        }, 200);
    });
};

export const addLikeToThread = (threadId) => updateThreadProperty(threadId, (thread) => ({ ...thread, likes: (thread.likes || 0) + 1 }));
export const addDislikeToThread = (threadId) => updateThreadProperty(threadId, (thread) => ({ ...thread, dislikes: (thread.dislikes || 0) + 1 }));
export const incrementViewCount = (threadId) => updateThreadProperty(threadId, (thread) => ({ ...thread, views: (thread.views || 0) + 1 }));

// --- Fungsi Komentar (Implementasi Baru) ---
export const addCommentToThread = (threadId, commentContent) => {
    return updateThreadProperty(threadId, (thread) => {
        const currentUser = getCurrentUser();
        const newComment = {
            id: 'c' + Date.now(),
            author: currentUser.name,
            content: commentContent,
            timestamp: new Date().toISOString(),
            likes: 0,
            dislikes: 0,
        };
        const updatedComments = [newComment, ...thread.comments];
        return {
            ...thread,
            comments: updatedComments,
            commentsCount: (thread.commentsCount || 0) + 1,
        };
    });
};

// --- Fungsi Bookmark (Implementasi Baru) ---
export const getBookmarks = () => JSON.parse(localStorage.getItem('bookmarks')) || [];
export const isBookmarked = (threadId) => getBookmarks().includes(threadId);
export const toggleBookmark = (threadId) => {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(threadId);
    if (index !== -1) {
        bookmarks.splice(index, 1); // Hapus jika sudah ada
    } else {
        bookmarks.push(threadId); // Tambah jika belum ada
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
};

// --- Fungsi Statistik & Profil (Implementasi Baru) ---
export const getForumStats = () => new Promise(resolve => {
    setTimeout(() => {
        const threads = getAllThreadsFromStorage();
        const totalThreads = threads.length;
        const totalComments = threads.reduce((sum, thread) => sum + (thread.commentsCount || 0), 0);
        resolve({
            totalThreads,
            totalComments,
            totalUsers: MOCK_USERS_COUNT // Simulasi
        });
    }, API_DELAY);
});

export const getUserProfileData = (username) => new Promise(resolve => {
    setTimeout(() => {
        const allThreads = getAllThreadsFromStorage();
        const userThreads = allThreads.filter(t => t.author === username);
        
        let commentCount = 0;
        let likesReceived = 0;
        
        // Menghitung total komentar dari pengguna lain di thread milik pengguna ini
        userThreads.forEach(thread => {
            likesReceived += (thread.likes || 0);
        });

        // Menghitung total komentar yang dibuat oleh pengguna ini di semua thread
        allThreads.forEach(thread => {
            thread.comments.forEach(comment => {
                if (comment.author === username) {
                    commentCount++;
                }
            });
        });

        resolve({
            name: username,
            threadCount: userThreads.length,
            commentCount: commentCount,
            likesReceived: likesReceived,
            threads: userThreads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        });
    }, API_DELAY);
});

// --- Fungsi Notifikasi (Implementasi Baru) ---
export const getNotifications = () => new Promise(resolve => {
    setTimeout(() => {
        // Ini adalah data notifikasi simulasi
        resolve([
            { id: 1, message: "Selamat datang di ForumKita! Jangan ragu untuk membuat thread pertamamu." },
            { id: 2, message: "Fitur baru: Mode Gelap sekarang tersedia! Cek di tombol bulan." }
        ]);
    }, 300);
});