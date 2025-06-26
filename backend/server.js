// backend/server.js (Versi Final Sebenarnya)

// --- 1. Impor Semua Modul ---
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('./middleware/authMiddleware');
const userRoutes = require('./routes/userRoutes');

// --- 2. Inisialisasi Aplikasi ---
const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

// --- 3. Gunakan Middleware ---
app.use(cors());
app.use(express.json());

// =================================================================
// --- PENGGUNAAN RUTE API ---
// =================================================================

// --- Rute Publik untuk Otentikasi ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "Semua field wajib diisi" });
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
        res.status(201).json({ message: "Registrasi berhasil!", userId: user.id });
    } catch (error) {
        res.status(500).json({ message: "Server error saat registrasi" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: "Email atau password salah" });
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Email atau password salah" });
        const token = jwt.sign({ id: user.id, name: user.name }, 'SECRET_KEY_YANG_SANGAT_RAHASIA', { expiresIn: '1h' });
        res.json({ message: "Login berhasil!", token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error saat login" });
    }
});

// --- Rute Publik untuk Membaca Data ---
app.get('/api/threads', async (req, res) => {
    const threads = await prisma.thread.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } }
    });
    res.json(threads);
});

app.get('/api/threads/:id', async (req, res) => {
    const thread = await prisma.thread.findUnique({
        where: { id: req.params.id },
        include: {
            author: { select: { name: true } },
            comments: {
                orderBy: { createdAt: 'asc' },
                include: { author: { select: { name: true } } }
            },
        },
    });
    if (thread) res.json(thread);
    else res.status(404).json({ message: 'Thread tidak ditemukan' });
});

// --- Rute Terlindungi (WAJIB Login) ---
app.post('/api/threads', protect, async (req, res) => {
    const { title, category, content } = req.body;
    const newThread = await prisma.thread.create({
        data: { title, category, content, authorId: req.user.id },
    });
    res.status(201).json(newThread);
});

app.post('/api/threads/:threadId/comments', protect, async (req, res) => {
    const { threadId } = req.params;
    const { content } = req.body;
    const [newComment, _] = await prisma.$transaction([
        prisma.comment.create({ data: { content, threadId, authorId: req.user.id } }),
        prisma.thread.update({ where: { id: threadId }, data: { commentsCount: { increment: 1 } } })
    ]);
    res.status(201).json(newComment);
});

// [INI DIA RUTE LIKE/DISLIKE YANG HILANG]
app.patch('/api/threads/:id/like', protect, async (req, res) => {
    const updatedThread = await prisma.thread.update({
        where: { id: req.params.id },
        data: { likes: { increment: 1 } },
    });
    res.json(updatedThread);
});

app.patch('/api/threads/:id/dislike', protect, async (req, res) => {
    const updatedThread = await prisma.thread.update({
        where: { id: req.params.id },
        data: { dislikes: { increment: 1 } },
    });
    res.json(updatedThread);
});


// --- Rute untuk Profil Pengguna (juga dilindungi) ---
app.use('/api/users', userRoutes);


// --- 4. Jalankan Server ---
app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});