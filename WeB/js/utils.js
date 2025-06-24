// js/utils.js
/**
 * Memformat timestamp menjadi string waktu relatif (misal: "2 jam yang lalu").
 * @param {string | number} timestamp - Timestamp dalam format ISO string atau milidetik.
 * @returns {string} String waktu yang diformat.
 */
export function formatDisplayDate(timestamp) {
    const date = new Date(timestamp);
    // Cek apakah tanggal valid. Jika tidak, kembalikan string kosong atau pesan error.
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    const now = new Date();
    const diffSeconds = Math.round((now - date) / 1000);
    const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
    if (diffSeconds < 60) { return rtf.format(-diffSeconds, 'second'); }
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) { return rtf.format(-diffMinutes, 'minute'); }
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) { return rtf.format(-diffHours, 'hour'); }
    const diffDays = Math.round(diffHours / 24);
    return rtf.format(-diffDays, 'day');
}
/**
 * Membuat fungsi yang menunda eksekusi hingga jeda waktu tertentu setelah event terakhir.
 * @param {Function} func - Fungsi yang akan di-debounce.
 * @param {number} [delay=400] - Jeda waktu dalam milidetik.
 * @returns {Function} Fungsi baru yang sudah di-debounce.
 */
export function debounce(func, delay = 400) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}