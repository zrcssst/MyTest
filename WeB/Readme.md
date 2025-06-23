# Website Forum Diskusi Modern

Proyek ini adalah implementasi frontend untuk sebuah website forum diskusi yang modern, aman, dan responsif. Dibuat dengan HTML5, CSS3, dan JavaScript vanilla (ES6+).

## Target & Tujuan

-   **Audiens**: Pengguna umum yang ingin berdiskusi dalam topik tertentu.
-   **Tujuan**: Menyediakan platform diskusi yang user-friendly, interaktif, dan aman dengan tampilan visual menarik.

## Fitur Utama
-   Desain Responsif (Desktop, Tablet, Mobile)
-   Tema Gelap & Terang (Dark/Light Mode) dengan penyimpanan preferensi di `localStorage`.
-   Pembuatan Thread dengan Validasi Form.
-   Tampilan Daftar Thread berbasis Kartu (Card-based).
-   Struktur kode modular dan mudah dikelola.
-   Keamanan input frontend dengan DOMPurify.

## Struktur Kode
```
/forum-website/
├── index.html                # Halaman utama (daftar thread)
├── bookmark.html             # Halaman Bookmark
├── Profil.html               # Halaman Profil
├── Login.html                # Halaman Login
├── thread.html               # Halaman detail thread (template)
├── create-thread.html        # Form untuk membuat thread baru
├── /templates/               # [BARU] Potongan HTML untuk komponen
│   ├── navbar.html           # Template untuk navigasi
│   └── footer.html           # Template untuk footer
├── /css/
│   ├── style.css             # Styling global, layout, komponen
│   ├── themes.css            # Variabel warna untuk tema gelap/terang
│   └── animations.css        # Animasi dan transisi
├── /js/
│   ├── api.js                # Simulasi API, manajemen data via localStorage
│   ├── global.js             # Skrip global & inisialisasi navbar
│   ├── templating.js         # [BARU] Logika untuk memuat template
│   ├── main.js               # Logika utama untuk halaman index
│   ├── thread-detail.js      # Logika untuk halaman detail thread
│   ├── profile.js            # Logika untuk halaman profil
│   ├── utils.js              # Fungsi bantuan umum (misal: format tanggal)
│   └── validation.js         # Fungsi utilitas untuk validasi form
├── /assets/
└── README.md
```

## Instalasi & Menjalankan Proyek Lokal

Tidak ada proses build yang diperlukan untuk versi frontend ini. Cukup ikuti langkah berikut:

1.  **Clone repositori ini:**
    ```bash
    git clone [URL-repositori-anda]
    ```
2.  **Buka direktori proyek:**
    ```bash
    cd forum-website
    ```
3.  **Buka file `index.html` di browser Anda.**
    -   Anda bisa langsung membuka file tersebut, atau menggunakan ekstensi "Live Server" di Visual Studio Code untuk pengalaman pengembangan yang lebih baik.

## Environment Variables
Saat ini proyek ini murni frontend dan tidak memerlukan environment variables. Jika diintegrasikan dengan backend (misalnya Firebase atau Node.js), variabel seperti `API_KEY` atau `DATABASE_URL` akan ditempatkan di file `.env`.

## Rencana Fitur Masa Depan (Future Features)
-   [ ] Integrasi dengan Backend (Firebase/Node.js) untuk data persisten.
-   [ ] Sistem Otentikasi Pengguna (Login/Register).
-   [ ] Halaman Detail Thread yang Fungsional (menampilkan komentar).
-   [ ] Sistem Komentar Bertingkat (Nested Replies).
-   [ ] Fitur Upvote/Downvote, Bookmark, dan Report.
-   [ ] Pencarian Real-time.
-   [ ] Notifikasi.