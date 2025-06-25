// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { protect } = require('../middleware/authMiddleware');

// Rute untuk mendapatkan profil pengguna yang sedang login
// Endpoint: GET /api/users/profile
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