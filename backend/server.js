// backend/server.js (Versi Final dengan Error Handling dan Keamanan)

// --- 1. Impor Semua Modul ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('./middleware/authMiddleware');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3000; //

// --- 3. Gunakan Middleware ---
// [PERBAIKAN] Konfigurasi CORS yang lebih aman
const frontendURL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
app.use(cors({ //
    origin: frontendURL, // Hanya izinkan akses dari frontend Anda
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], //
    allowedHeaders: ['Content-Type', 'Authorization'] //
}));
app.use(express.json()); //

// =================================================================
// --- PENGGUNAAN RUTE API ---
// =================================================================

// --- Rute Publik untuk Otentikasi ---
app.post('/api/auth/register', async (req, res) => { //
    try {
        const { name, email, password } = req.body; //
        if (!name || !email || !password) return res.status(400).json({ message: "Semua field wajib diisi" }); //
        const existingUser = await prisma.user.findUnique({ where: { email } }); //
        if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar" }); //
        const hashedPassword = await bcrypt.hash(password, 10); //
        const user = await prisma.user.create({ data: { name, email, password: hashedPassword } }); //
        res.status(201).json({ message: "Registrasi berhasil!", userId: user.id }); //
    } catch (error) {
        res.status(500).json({ message: "Server error saat registrasi" }); //
    }
});

app.post('/api/auth/login', async (req, res) => { //
    try {
        const { email, password } = req.body; //
        const user = await prisma.user.findUnique({ where: { email } }); //
        if (!user) return res.status(400).json({ message: "Email atau password salah" }); //
        const isPasswordCorrect = await bcrypt.compare(password, user.password); //
        if (!isPasswordCorrect) return res.status(400).json({ message: "Email atau password salah" }); //
        const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' }); //
        res.json({ message: "Login berhasil!", token, user: { id: user.id, name: user.name, email: user.email } }); //
    } catch (error) {
        res.status(500).json({ message: "Server error saat login" }); //
    }
});

// --- Rute Publik untuk Membaca Data ---
app.get('/api/threads', async (req, res) => { //
    try {
        // 1. Ambil parameter dari query URL (misal: ?page=2&sort=populer)
        const page = parseInt(req.query.page) || 1; //
        const limit = 15; // Tentukan jumlah item per halaman
        const skip = (page - 1) * limit; //

        const { sort, category, keyword } = req.query; //

        // 2. Siapkan kondisi filter untuk Prisma
        const where = {}; //
        if (category && category !== 'all') { //
            where.category = category; //
        }
        if (keyword) { //
            where.OR = [ //
                { title: { contains: keyword, mode: 'insensitive' } }, //
                { author: { name: { contains: keyword, mode: 'insensitive' } } } //
            ];
        }

        // 3. Siapkan kondisi pengurutan untuk Prisma
        let orderBy = { createdAt: 'desc' }; // Default sort
        if (sort === 'trending') { //
            orderBy = { views: 'desc' }; //
        } else if (sort === 'populer') { //
            // Catatan: Sorting berdasarkan 'likes' + 'comments' secara langsung di Prisma ORM
            // sedikit rumit. Untuk sekarang, kita sederhanakan 'populer' berarti paling banyak disukai.
            orderBy = { likes: 'desc' }; //
        }

        // 4. Jalankan dua query: satu untuk mengambil data, satu untuk menghitung total
        const threads = await prisma.thread.findMany({ //
            where, //
            orderBy, //
            skip, //
            take: limit, //
            include: { //
                author: { select: { name: true } } //
            }
        });

        const totalThreads = await prisma.thread.count({ where }); //
        const totalPages = Math.ceil(totalThreads / limit); //

        // 5. Kirim data beserta informasi paginasi
        res.json({ //
            threads, //
            currentPage: page, //
            totalPages //
        });

    } catch (error) {
        console.error("Gagal mengambil threads:", error); //
        res.status(500).json({ message: "Server error saat mengambil threads" }); //
    }
});

app.get('/api/threads/:id', async (req, res) => { //
    try {
          await prisma.thread.update({
            where: { id: req.params.id },
            data: { views: { increment: 1 } },
        });
         let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Token tidak valid, abaikan saja, user dianggap tidak login
                console.log("Token tidak valid saat memeriksa bookmark.");
            }
        }
        const thread = await prisma.thread.findUnique({ //
            where: { id: req.params.id }, //
            // [PERBAIKAN] Gunakan 'select' untuk memastikan semua data terkirim
            select: { //
                id: true, //
                title: true, //
                content: true, //
                createdAt: true, //
                likes: true,      // <-- Memastikan data 'likes' terkirim
                dislikes: true,   // <-- Memastikan data 'dislikes' terkirim
                author: { //
                    select: { name: true } //
                },
                comments: { //
                    orderBy: { createdAt: 'asc' }, //
                    select: { //
                        id: true, //
                        content: true, //
                        createdAt: true, //
                        author: { //
                            select: { name: true } //
                        }
                    }
                }
            }
        });

        if (thread) { //
            res.json(thread); //
        } else {
            res.status(404).json({ message: 'Thread tidak ditemukan' }); //
        }
         let isBookmarked = false;
        if (userId) {
            const bookmark = await prisma.bookmark.findUnique({
                where: {
                    userId_threadId: { userId, threadId: thread.id }
                }
            });
            isBookmarked = !!bookmark; // Konversi ke boolean
        }
         const responseData = { ...thread, isBookmarked };

        await prisma.thread.update({
            where: { id: req.params.id },
            data: { views: { increment: 1 } },
        });
    } catch (error) {
        console.error("Gagal mengambil detail thread:", error); //
        res.status(500).json({ message: "Server error saat mengambil thread" }); //
    }
});


// --- Rute Terlindungi (WAJIB Login) ---
app.post('/api/threads', protect, async (req, res) => { //
    const { title, category, content } = req.body; //
    const newThread = await prisma.thread.create({ //
        data: { title, category, content, authorId: req.user.id }, //
    });
    res.status(201).json(newThread); //
});

app.post('/api/threads/:threadId/comments', protect, async (req, res) => { //
    const { threadId } = req.params; //
    const { content } = req.body; //
    const [newComment, _] = await prisma.$transaction([ //
        prisma.comment.create({ data: { content, threadId, authorId: req.user.id } }), //
        prisma.thread.update({ where: { id: threadId }, data: { commentsCount: { increment: 1 } } }) //
    ]);
    res.status(201).json(newComment); //
});

// [INI DIA RUTE LIKE/DISLIKE YANG HILANG]
app.patch('/api/threads/:id/like', protect, async (req, res) => { //
    try {
        const updatedThread = await prisma.thread.update({ //
            where: { id: req.params.id }, //
            data: { likes: { increment: 1 } }, //
        });
        res.json(updatedThread); //
    } catch (error) {
        console.error("Error saat menyukai thread:", error);
        // Prisma akan melempar eror dengan kode P2025 jika record tidak ditemukan
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Thread tidak ditemukan untuk disukai.' });
        }
        // Untuk eror lainnya
        res.status(500).json({ message: 'Terjadi eror di server saat memproses permintaan Anda.' });
    }
});

app.patch('/api/threads/:id/dislike', protect, async (req, res) => { //
    try {
        const updatedThread = await prisma.thread.update({ //
            where: { id: req.params.id }, //
            data: { dislikes: { increment: 1 } }, //
        });
        res.json(updatedThread); //
    } catch (error) {
        console.error("Error saat tidak menyukai thread:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Thread tidak ditemukan untuk tidak disukai.' });
        }
        res.status(500).json({ message: 'Terjadi eror di server saat memproses permintaan Anda.' });
    }
});


// --- Rute untuk Profil Pengguna dan Statistik ---
app.use('/api/users', userRoutes); //

app.get('/api/stats', async (req, res) => { //
    try {
        const totalThreads = await prisma.thread.count(); //
        const totalComments = await prisma.comment.count(); //
        const totalUsers = await prisma.user.count(); //
        res.json({ totalThreads, totalComments, totalUsers }); //
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil statistik' }); //
    }
});

// --- 4. Jalankan Server ---
app.listen(PORT, () => { //
  console.log(`Server backend berjalan di http://localhost:${PORT}`); //
});