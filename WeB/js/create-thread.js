// js/create-thread.js
import { loadNavbar, loadFooter } from './templating.js';
import { validateField } from './validation.js';
import { saveNewThread, getCurrentUser } from './api.js';
import { showToast, showError } from './ui.js';

// Fungsi untuk inisialisasi halaman
async function initializePage() {
    await loadNavbar();
    await loadFooter();

    const form = document.getElementById('create-thread-form');
    if (!form) return;

    const titleInput = document.getElementById('thread-title');
    const contentInput = document.getElementById('thread-content');
    const categoryInput = document.getElementById('thread-category');
    const submitButton = form.querySelector('button[type="submit"]');

    // Validasi Real-time
    titleInput.addEventListener('blur', () => validateField(titleInput, 'title-error', 'Judul minimal 10 karakter.'));
    contentInput.addEventListener('blur', () => validateField(contentInput, 'content-error', 'Konten tidak boleh kosong.'));
    categoryInput.addEventListener('change', () => validateField(categoryInput, 'category-error', 'Silakan pilih kategori.'));

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Validasi akhir sebelum submit
        const isTitleValid = validateField(titleInput, 'title-error', 'Judul minimal 10 karakter.');
        const isContentValid = validateField(contentInput, 'content-error', 'Konten tidak boleh kosong.');
        const isCategoryValid = validateField(categoryInput, 'category-error', 'Silakan pilih kategori.');

        if (isTitleValid && isContentValid && isCategoryValid) {
            submitButton.disabled = true;
            submitButton.textContent = 'Memproses...';

            try {
                const currentUser = getCurrentUser();
                const sanitizedContent = DOMPurify.sanitize(contentInput.value);
                
                const newThread = {
                    title: titleInput.value,
                    category: categoryInput.value,
                    content: sanitizedContent,
                    author: currentUser.name,
                    timestamp: new Date().toISOString(),
                    views: 0,
                    commentsCount: 0,
                    likes: 0,
                    dislikes: 0,
                    comments: []
                };

                await saveNewThread(newThread);
                window.location.href = 'index.html?status=thread_created';
            } catch (error) {
                showError('menyimpan thread', error);
                submitButton.disabled = false;
                submitButton.textContent = 'Publikasikan Thread';
            }
        } else {
            showToast('Harap perbaiki error pada form.', 'error');
        }
    });
}

// Jalankan inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', initializePage);