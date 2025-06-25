// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // GANTI <password> DENGAN PASSWORD DATABASE ANDA
        // GANTI nama_database_anda DENGAN NAMA DATABASE YANG ANDA INGINKAN (misal: 'forumkita-db')
        const connectionString = 'mongodb+srv://forumkita_user:<password>@forumkitacluster.xxxxx.mongodb.net/nama_database_anda?retryWrites=true&w=majority&appName=ForumKitaCluster';

        const conn = await mongoose.connect(connectionString);

        console.log(`MongoDB Terhubung: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Keluar dari proses dengan status gagal
    }
};

module.exports = connectDB;