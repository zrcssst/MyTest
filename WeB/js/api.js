// WeB/js/api.js (Versi Final dengan Penanganan 401)

const API_URL = 'http://localhost:3000/api'; //

/**
 * Fungsi logout terpusat. Menghapus data dari localStorage dan mengarahkan ke login.
 */
export const logout = () => { //
    localStorage.removeItem('token'); //
    localStorage.removeItem('currentUser'); //
    // Arahkan ke halaman login dan berikan pesan bahwa sesi telah berakhir
    window.location.href = 'login.html?status=session_expired'; //
};

const getAuthHeaders = () => { //
    const token = localStorage.getItem('token'); //
    // Jika tidak ada token, jangan sertakan header Authorization sama sekali
    if (!token) {
        return { 'Content-Type': 'application/json' };
    }
    return { //
        'Content-Type': 'application/json', //
        'Authorization': `Bearer ${token}` //
    };
};

/**
 * [BARU] Wrapper untuk fetch yang menangani respons API secara terpusat.
 * Terutama untuk menangani kasus 401 (Unauthorized).
 */
const handleApiResponse = async (response) => {
    if (response.status === 401) {
        // Jika token tidak valid atau kedaluwarsa, logout pengguna
        logout();
        // Lempar eror agar promise chain berhenti di sini
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
    }

    const data = await response.json();

    if (!response.ok) {
        // Untuk eror lainnya (400, 404, 500, dll), lempar pesan dari server
        throw new Error(data.message || 'Terjadi kesalahan pada server.');
    }

    return data;
};

// --- FUNGSI OTENTIKASI ---
export const register = async (userData) => { //
    const response = await fetch(`${API_URL}/auth/register`, { //
        method: 'POST', //
        headers: { 'Content-Type': 'application/json' }, //
        body: JSON.stringify(userData), //
    });
    return handleApiResponse(response);
};

export const login = async (credentials) => { //
    const response = await fetch(`${API_URL}/auth/login`, { //
        method: 'POST', //
        headers: { 'Content-Type': 'application/json' }, //
        body: JSON.stringify(credentials), //
    });
    const data = await handleApiResponse(response); //
    
    if (data.token) { //
        localStorage.setItem('token', data.token); //
        localStorage.setItem('currentUser', JSON.stringify(data.user)); //
    }
    return data; //
};

export const getCurrentUser = () => { //
    const user = localStorage.getItem('currentUser'); //
    return user ? JSON.parse(user) : null; //
};

// --- API UNTUK THREAD & KOMENTAR ---
export const getThreads = async (params = {}) => { //
    const response = await fetch(`${API_URL}/threads?${new URLSearchParams(params)}`); //
    return handleApiResponse(response);
};

export const getThreadById = async (id) => { //
    const response = await fetch(`${API_URL}/threads/${id}`); //
    return handleApiResponse(response);
};

export const saveNewThread = async (threadData) => { //
    const response = await fetch(`${API_URL}/threads`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(threadData) }); //
    return handleApiResponse(response);
};

export const addCommentToThread = async (threadId, commentData) => { //
    const response = await fetch(`${API_URL}/threads/${threadId}/comments`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(commentData) }); //
    return handleApiResponse(response);
};

export const addLikeToThread = async (threadId) => { //
    const response = await fetch(`${API_URL}/threads/${threadId}/like`, { method: 'PATCH', headers: getAuthHeaders() }); //
    return handleApiResponse(response);
};

export const addDislikeToThread = async (threadId) => { //
    const response = await fetch(`${API_URL}/threads/${threadId}/dislike`, { method: 'PATCH', headers: getAuthHeaders() }); //
    return handleApiResponse(response);
};
export const addBookmark = async (threadId) => {
    const response = await fetch(`${API_URL}/users/bookmarks/${threadId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
};

export const removeBookmark = async (threadId) => {
    const response = await fetch(`${API_URL}/users/bookmarks/${threadId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
};
export const getForumStats = async () => {
    const response = await fetch(`${API_URL}/stats`);
    // Gunakan handleApiResponse jika Anda sudah menerapkannya, jika tidak, gunakan try-catch
     return handleApiResponse(response);
};

export const getUserProfileData = async () => { //
    const response = await fetch(`${API_URL}/users/profile`, { headers: getAuthHeaders() }); //
    return handleApiResponse(response);
};
export const getBookmarkedThreads = async () => {
    const response = await fetch(`${API_URL}/users/bookmarks`, {
        headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
};

// ... Fungsi dummy atau belum terimplementasi ...
export const getNotifications = () => Promise.resolve([{ id: 1, message: "Selamat datang di ForumKita!" }]); //
export const toggleBookmark = (threadId) => {
    console.warn("Fitur toggle bookmark belum terhubung ke backend."); 
    // Logika untuk menambah/menghapus bookmark di masa depan akan ada di sini
};