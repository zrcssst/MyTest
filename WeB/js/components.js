// js/components.js (Versi Final)
import { formatDisplayDate } from './utils.js';

/**
 * Membuat dan mengembalikan elemen kartu thread (HTML element).
 * @param {object} thread - Objek thread yang berisi data untuk ditampilkan.
 * @returns {HTMLElement} Elemen <article> yang sudah jadi.
 */
export function createThreadCard(thread) {
    const card = document.createElement('article');
    card.className = 'thread-card';

    const titleLink = document.createElement('a');
    titleLink.href = `thread.html?id=${thread.id}`;
    titleLink.className = 'thread-card__title';
    titleLink.textContent = thread.title;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'thread-card__meta';
    // [PERBAIKAN] Menggunakan 'createdAt' sesuai dengan data dari database
    metaDiv.innerHTML = `<span>Oleh <strong>${thread.author.name}</strong></span> • <time>${formatDisplayDate(thread.createdAt)}</time>`;

    const statsDiv = document.createElement('div');
    statsDiv.className = 'thread-card__stats';

    const createStatSpan = (iconClass, text) => {
        const span = document.createElement('span');
        span.innerHTML = `<i class="${iconClass}"></i> ${text}`;
        return span;
    };

    const tagSpan = document.createElement('span');
    tagSpan.className = `thread-card__tag thread-card__tag--${thread.category || 'umum'}`;
    tagSpan.textContent = thread.category || 'umum';

    statsDiv.append(
        createStatSpan('fa-regular fa-eye', thread.views || 0),
        createStatSpan('fa-regular fa-thumbs-up', thread.likes || 0),
        createStatSpan('fa-regular fa-comment', thread.commentsCount || 0),
        tagSpan
    );

    card.append(titleLink, metaDiv, statsDiv);
    return card;
}