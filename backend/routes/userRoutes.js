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
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;