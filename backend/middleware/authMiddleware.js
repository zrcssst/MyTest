// backend/middleware/authMiddleware.js (Versi dengan Prisma Terpusat)

const jwt = require('jsonwebtoken');
// [DIHAPUS] const { PrismaClient } = require('@prisma/client');
const prisma = require('../lib/prisma'); // [DIUBAH] Impor instance tunggal dari prisma.js

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, name: true, email: true }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Tidak terotorisasi, pengguna tidak ditemukan' });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Tidak terotorisasi, token gagal atau kedaluwarsa' });
        }
    } else {
        res.status(401).json({ message: 'Tidak terotorisasi, tidak ada token' });
    }
};

module.exports = { protect };