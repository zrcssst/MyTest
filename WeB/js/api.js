// WeB/js/api.js (Versi dengan API Komentar)
const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Format standar: "Bearer spasi token"
    };
};
// --- FUNGSI OTENTIKASI BARU ---
export const register = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
};

export const login = async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    // Simpan token dan data user ke localStorage agar sesi tetap ada
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
};

export const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
};


export const getAllThreads = async () => {
    try {
        const response = await fetch(`${API_URL}/threads`);
        if (!response.ok) throw new Error('Gagal mengambil data threads');
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil semua threads:", error);
        return [];
    }
};

export const getThreadById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/threads/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil detail thread');
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil detail thread:", error);
        throw error;
    }
};

export const saveNewThread = async (threadData) => {
    const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: getAuthHeaders(), // <-- Gunakan header otorisasi
        body: JSON.stringify(threadData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mempublikasikan thread');
    }
    return await response.json();
};

// [DIUBAH] Fungsi ini sekarang menyertakan header otorisasi
export const addCommentToThread = async (threadId, commentData) => {
    const response = await fetch(`${API_URL}/threads/${threadId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(), // <-- Gunakan header otorisasi
        body: JSON.stringify(commentData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengirim komentar');
    }
    return await response.json();
};

// [DIUBAH] Fungsi ini sekarang menyertakan header otorisasi
export const addLikeToThread = async (threadId) => {
    const response = await fetch(`${API_URL}/threads/${threadId}/like`, {
        method: 'PATCH',
        headers: getAuthHeaders(), // <-- Gunakan header otorisasi
    });
    if (!response.ok) throw new Error('Gagal menyukai thread');
    return await response.json();
};

// [DIUBAH] Fungsi ini sekarang menyertakan header otorisasi
export const addDislikeToThread = async (threadId) => {
    const response = await fetch(`${API_URL}/threads/${threadId}/dislike`, {
        method: 'PATCH',
        headers: getAuthHeaders(), // <-- Gunakan header otorisasi
    });
    if (!response.ok) throw new Error('Gagal melakukan dislike pada thread');
    return await response.json();
};


// --- Fungsi Lainnya ---
export const getForumStats = async () => {
    try {
        const response = await fetch(`${API_URL}/stats`);
        if (!response.ok) throw new Error('Gagal mengambil data statistik');
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil statistik forum:", error);
        // Kembalikan nilai default jika gagal
        return { totalThreads: 0, totalComments: 0, totalUsers: 0 };
    }
};
export const getUserProfileData = async () => {
    // Fungsi ini mendapatkan token dari header untuk otentikasi
    const response = await fetch(`${API_URL}/users/profile`, {
        headers: getAuthHeaders(), 
    });
    
    // Jika permintaan gagal, lempar error
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data profil');
    }
    
    // Jika berhasil, kembalikan data profil dalam format JSON
    return await response.json();
};
export const getNotifications = () => Promise.resolve([{ id: 1, message: "Selamat datang!" }]);
export const incrementViewCount = () => console.warn("Fitur belum terhubung ke backend.");
export const getBookmarks = () => [];
export const isBookmarked = () => false;
export const toggleBookmark = () => console.warn("Fitur belum terhubung ke backend.");