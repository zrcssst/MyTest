// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
    let token;

    // 1. Cek apakah ada token di header 'Authorization'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Ambil token dari header (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // 3. Verifikasi token menggunakan secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Ambil data pengguna dari database berdasarkan ID di dalam token,
            //    lalu tempelkan ke objek 'req' agar bisa digunakan oleh rute selanjutnya.
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, name: true, email: true } // Pilih data yg aman untuk ditempel
            });

            next(); // Lanjutkan ke rute API yang sebenarnya
        } catch (error) {
            res.status(401).json({ message: 'Tidak terotorisasi, token gagal' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Tidak terotorisasi, tidak ada token' });
    }
};

module.exports = { protect };