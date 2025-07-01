// backend/routes/userRoutes.js (Versi Perbaikan Final yang Benar)

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { protect } = require('../middleware/authMiddleware');

// Rute untuk mendapatkan profil pengguna (tidak berubah)
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

// Rute untuk mendapatkan daftar bookmark (tidak berubah)
router.get('/bookmarks', protect, async (req, res) => {
    try {
        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                thread: {
                    include: {
                        author: { select: { name: true } }
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


// --- BAGIAN PENTING ADA DI SINI ---

// Rute untuk MENAMBAHKAN bookmark
router.post('/bookmarks/:threadId', protect, async (req, res) => {
    const { threadId } = req.params;
    const userId = req.user.id;

    try {
        // Gunakan transaksi untuk memastikan kedua operasi berhasil
        const [newBookmark, updatedThread] = await prisma.$transaction([
            // Operasi 1: Buat entri baru di tabel Bookmark. HANYA ada userId dan threadId.
            prisma.bookmark.create({
                data: {
                    userId: userId,
                    threadId: threadId
                }
            }),
            // Operasi 2: Tambah penghitung di tabel Thread.
            prisma.thread.update({
                where: { id: threadId },
                data: { bookmarksCount: { increment: 1 } }
            })
        ]);
        res.status(201).json({ message: "Bookmark berhasil ditambahkan", bookmark: newBookmark });
    } catch (error) {
        // 'P2002' adalah kode error Prisma untuk 'unique constraint failed'
        if (error.code === 'P2002') { 
             return res.status(409).json({ message: "Thread sudah di-bookmark." });
        }
        console.error("Error saat menambah bookmark:", error);
        res.status(500).json({ message: "Server Error saat menambah bookmark" });
    }
});

// Rute untuk MENGHAPUS bookmark
router.delete('/bookmarks/:threadId', protect, async (req, res) => {
    const { threadId } = req.params;
    const userId = req.user.id;

    try {
        // Gunakan transaksi untuk memastikan kedua operasi berhasil
        const [deletedBookmark, updatedThread] = await prisma.$transaction([
            // Operasi 1: Hapus entri dari tabel Bookmark
            prisma.bookmark.delete({
                where: {
                    userId_threadId: {
                        userId: userId,
                        threadId: threadId
                    }
                }
            }),
            // Operasi 2: Kurangi penghitung di tabel Thread
            prisma.thread.update({
                where: { id: threadId },
                data: { bookmarksCount: { decrement: 1 } }
            })
        ]);
        res.status(200).json({ message: "Bookmark berhasil dihapus" });
    } catch (error) {
        // 'P2025' adalah kode error Prisma untuk 'record to delete does not exist'
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Bookmark tidak ditemukan untuk dihapus." });
        }
        console.error("Error saat menghapus bookmark:", error);
        res.status(500).json({ message: "Server Error saat menghapus bookmark" });
    }
});

module.exports = router;    