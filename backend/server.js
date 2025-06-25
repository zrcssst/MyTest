// backend/server.js (Versi Final, Lengkap, dan Terstruktur)

// --- 1. Impor Semua Modul ---
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('./middleware/authMiddleware'); // Pastikan file ini ada di folder middleware
const userRoutes = require('./routes/userRoutes');
// --- 2. Inisialisasi Aplikasi ---
const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// --- 3. Gunakan Middleware ---
app.use(cors());
app.use(express.json());

// =================================================================
// --- RUTE API ---
// =================================================================

// --- Rute Publik untuk Otentikasi (TIDAK PERLU 'protect') ---

// Rute untuk REGISTRASI pengguna baru
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
        }
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        res.status(201).json({ message: "Registrasi berhasil!", userId: user.id });
    } catch (error) {
        console.error("Error saat registrasi:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server saat registrasi" });
    }
});

// Rute untuk LOGIN pengguna
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Email atau password salah" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Email atau password salah" });
        }
        const token = jwt.sign(
            { id: user.id, name: user.name },
            'SECRET_KEY_YANG_SANGAT_RAHASIA',
            { expiresIn: '1h' }
        );
        res.json({
            message: "Login berhasil!",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Error saat login:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server saat login" });
    }
});


// --- Rute Publik untuk Membaca Data (TIDAK PERLU 'protect') ---
app.get('/api/threads', async (req, res) => {
    try {
        const threads = await prisma.thread.findMany({
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { name: true } } }
        });
        res.json(threads);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/api/threads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const thread = await prisma.thread.findUnique({
            where: { id: id },
            include: {
                author: { select: { name: true } },
                comments: {
                    orderBy: { createdAt: 'asc' },
                    include: { author: { select: { name: true } } }
                },
            },
        });
        if (thread) {
            res.json(thread);
        } else {
            res.status(404).json({ message: 'Thread tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// --- Rute Terlindungi (WAJIB Login -> Diberi 'protect') ---
app.post('/api/threads', protect, async (req, res) => {
    try {
        const { title, category, content } = req.body;
        if (!title || !category || !content) {
            return res.status(400).json({ message: 'Judul, kategori, dan konten wajib diisi' });
        }
        const newThread = await prisma.thread.create({
            data: {
                title,
                category,
                content,
                authorId: req.user.id // ID diambil dari token pengguna yang login
            },
        });
        res.status(201).json(newThread);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/threads/:threadId/comments', protect, async (req, res) => {
    try {
        const { threadId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Konten wajib diisi' });
        }

        // [DIUBAH] Menggunakan transaksi database
        const [newComment, updatedThread] = await prisma.$transaction([
            // Operasi 1: Buat komentar baru
            prisma.comment.create({
                data: {
                    content,
                    threadId,
                    authorId: req.user.id
                },
            }),
            // Operasi 2: Update jumlah komentar di thread
            prisma.thread.update({
                where: { id: threadId },
                data: {
                    commentsCount: {
                        increment: 1
                    }
                }
            })
        ]);

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error saat membuat komentar:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// ... (rute untuk like/dislike jika sudah dibuat juga perlu 'protect') ...


// --- 4. Jalankan Server ---
app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});