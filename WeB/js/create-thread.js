// WeB/js/create-thread.js

import { saveNewThread } from './api.js';
import { validateField } from './validation.js';
import { loadLayout } from './layout.js';
import { showToast, showError } from './ui.js';
import { protectPage } from './authGuard.js';

// Fungsi untuk validasi seluruh formulir
function validateForm(titleInput, categoryInput, contentInput) {
    const isTitleValid = validateField(titleInput, 'title-error', 'Judul harus diisi dan minimal 10 karakter.');
    const isCategoryValid = validateField(categoryInput, 'category-error', 'Kategori harus dipilih.');
    const isContentValid = validateField(contentInput, 'content-error', 'Konten tidak boleh kosong.');
    return isTitleValid && isCategoryValid && isContentValid;
}

// Inisialisasi halaman
async function initializeCreateThreadPage() {
    await loadLayout();

    const form = document.getElementById('create-thread-form');
    const titleInput = document.getElementById('thread-title');
    const categoryInput = document.getElementById('thread-category');
    const contentInput = document.getElementById('thread-content');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (validateForm(titleInput, categoryInput, contentInput)) {
            submitButton.disabled = true;
            submitButton.textContent = 'Memublikasikan...';

            const threadData = {
                title: titleInput.value.trim(),
                category: categoryInput.value,
                content: contentInput.value.trim()
            };

            try {
                const newThread = await saveNewThread(threadData);
                // Arahkan ke halaman utama dengan pesan sukses
                window.location.href = `index.html?status=thread_created`;
            } catch (error) {
                showError('memublikasikan thread', error);
                submitButton.disabled = false;
                submitButton.textContent = 'Publikasikan Thread';
            }
        } else {
            showToast('Harap perbaiki eror pada formulir.', 'error');
        }
    });
}

// Jalankan setelah DOM siap dan otentikasi berhasil
document.addEventListener('DOMContentLoaded', () => {
    if (protectPage()) {
        initializeCreateThreadPage();
    }
});