// backend/lib/prisma.js
const { PrismaClient } = require('@prisma/client');

// Buat satu instance dari PrismaClient
const prisma = new PrismaClient();

// Ekspor instance tunggal ini untuk digunakan di seluruh aplikasi
module.exports = prisma;