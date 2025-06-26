// backend/routes/userRoutes.js (Versi dengan Prisma Terpusat)

const express = require('express');
const router = express.Router();
// [DIHAPUS] const { PrismaClient } = require('@prisma/client');
const prisma = require('../lib/prisma'); // [DIUBAH] Impor instance tunggal dari prisma.js
const { protect } = require('../middleware/authMiddleware');

// Rute untuk mendapatkan profil pengguna (tidak ada perubahan logika)
router.get('/profile', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                threads: { orderBy: { createdAt: 'desc' } },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: { thread: { select: { id: true, title: true } } }
                }
            }
        });
        if (!userProfile) {
            return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }
        res.json(userProfile);
    } catch (error) {
        console.error("Error saat mengambil profil:", error);
        res.status(500).json({ message: "Server Error saat mengambil profil" });
    }
});

// Rute untuk mendapatkan bookmark (tidak ada perubahan logika)
router.get('/bookmarks', protect, async (req, res) => {
    try {
        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                thread: {
                    include: {
                        author: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        const bookmarkedThreads = bookmarks.map(bookmark => bookmark.thread);
        res.json(bookmarkedThreads);
    } catch (error) {
        console.error("Error saat mengambil bookmark:", error);
        res.status(500).json({ message: "Server Error saat mengambil bookmark" });
    }
});

module.exports = router;