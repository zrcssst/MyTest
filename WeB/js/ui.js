// js/ui.js

/**
 * Menampilkan notifikasi toast di pojok layar.
 * @param {string} message - Pesan yang akan ditampilkan.
 * @param {string} type - 'success' (hijau) atau 'error' (merah).
 * @param {number} duration - Durasi dalam milidetik.
 */
export function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Animasi masuk
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Animasi keluar dan hapus
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }, duration);
}

/**
 * Menampilkan pesan error standar menggunakan toast.
 * @param {string} action - Deskripsi aksi yang gagal (misal: "memuat thread").
 * @param {Error} error - Objek error (opsional).
 */
export function showError(action, error = null) {
    console.error(`Gagal ${action}:`, error);
    showToast(`Terjadi kesalahan saat ${action}. Silakan coba lagi.`, 'error');
}


/**
 * Merender skeleton loader untuk daftar thread.
 * @param {HTMLElement} container - Elemen kontainer untuk skeleton.
 */
export function renderLoadingSkeletons(container) {
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        card.innerHTML = `<div class="skeleton title"></div><div class="skeleton text"></div><div class="skeleton text" style="width: 80%;"></div>`;
        container.appendChild(card);
    }
};

/**
 * Merender state kosong jika tidak ada data.
 * @param {HTMLElement} container - Elemen kontainer.
 * @param {string} message - Pesan yang akan ditampilkan.
 */
export function renderEmptyState(container, message) {
    container.innerHTML = `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><p>${message}</p></div>`;
};