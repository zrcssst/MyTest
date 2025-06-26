// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { protect } = require('../middleware/authMiddleware');

// Rute untuk mendapatkan profil pengguna yang sedang login
// Endpoint: GET /api/users/profile
router.get('/bookmarks', protect, async (req, res) => {
    try {
        // Asumsi Anda punya model Bookmark di Prisma
        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: req.user.id },
            include: {
                thread: { // Sertakan data thread lengkap
                    include: {
                        author: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Ekstrak hanya data thread dari hasil bookmark
        const bookmarkedThreads = bookmarks.map(b => b.thread);
        res.json(bookmarkedThreads);

    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil bookmark" });
    }
});
router.get('/profile', protect, async (req, res) => {
    try {
        // Middleware 'protect' sudah menempelkan data user ke req.user
        const userId = req.user.id;

        // Ambil data pengguna beserta semua thread dan komentarnya
        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                // Ambil semua thread yang dibuat oleh user ini
                threads: {
                    orderBy: { createdAt: 'desc' }
                },
                // Ambil semua komentar yang dibuat oleh user ini
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        thread: { // Sertakan info thread tempat komentar dibuat
                            select: { id: true, title: true }
                        }
                    }
                }
            }
        });

        if (!userProfile) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }

        res.json(userProfile);

    } catch (error) {
        console.error("Error saat mengambil profil:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;