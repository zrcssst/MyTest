// js/utils.js
function formatDisplayDate(timestamp) {
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

function debounce(func, delay = 400) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}