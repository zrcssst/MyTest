// WeB/js/create-thread.js (Versi Final)

// Impor fungsi-fungsi yang kita butuhkan
import { saveNewThread, getCurrentUser } from './api.js';
import { loadLayout } from './layout.js'; // Menggunakan layout loader kita yang praktis
import { validateField } from './validation.js';
import { showToast, showError } from './ui.js';

// Fungsi utama yang akan berjalan saat halaman dimuat
async function initializeCreateThreadPage() {
    // Muat komponen standar seperti navbar dan footer
    await loadLayout();

    // Dapatkan elemen-elemen form dari HTML
    const createThreadForm = document.getElementById('create-thread-form');
    const titleInput = document.getElementById('thread-title');
    const categoryInput = document.getElementById('thread-category');
    const contentInput = document.getElementById('thread-content');
    const submitButton = createThreadForm.querySelector('button[type="submit"]');

    // Pastikan form ada sebelum menambahkan event listener
    if (!createThreadForm) return;

    // Tambahkan event listener untuk submit form
    createThreadForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Mencegah form dari refresh halaman

        // Lakukan validasi untuk setiap field
        const isTitleValid = validateField(titleInput, 'title-error', 'Judul harus diisi dan minimal 10 karakter.');
        const isCategoryValid = validateField(categoryInput, 'category-error', 'Kategori harus dipilih.');
        const isContentValid = validateField(contentInput, 'content-error', 'Konten tidak boleh kosong.');

        // Jika ada yang tidak valid, berhenti
        if (!isTitleValid || !isCategoryValid || !isContentValid) {
            showToast('Harap perbaiki error pada form.', 'error');
            return;
        }

        // Nonaktifkan tombol untuk mencegah klik ganda
        submitButton.disabled = true;
        submitButton.textContent = 'Memublikasikan...';

        try {
            const currentUser = getCurrentUser();
            // Siapkan objek data thread untuk dikirim ke backend
            const newThreadData = {
                title: titleInput.value.trim(),
                category: categoryInput.value,
                content: contentInput.value.trim(),
                author: currentUser ? currentUser.name : 'Anonim', // Dapatkan nama pengguna yang sedang login
            };

            // Panggil fungsi API untuk menyimpan thread baru
            await saveNewThread(newThreadData);

            // Jika berhasil, arahkan ke halaman utama dengan notifikasi
            window.location.href = 'index.html?status=thread_created';

        } catch (error) {
            // Jika gagal, tampilkan pesan error dan aktifkan kembali tombolnya
            showError('memublikasikan thread', error);
            submitButton.disabled = false;
            submitButton.textContent = 'Publikasikan Thread';
        }
    });
}

// Jalankan fungsi inisialisasi saat seluruh konten halaman dimuat
document.addEventListener('DOMContentLoaded', initializeCreateThreadPage);