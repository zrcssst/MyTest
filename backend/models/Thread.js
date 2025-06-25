// backend/models/Thread.js
const mongoose = require('mongoose');

// Membuat Skema (Blueprint)
const threadSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true // Wajib ada
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0 // Nilai default jika tidak diisi
    },
    likes: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Otomatis menambahkan field createdAt dan updatedAt
});

// Membuat Model dari Skema
const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;