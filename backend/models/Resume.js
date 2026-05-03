const mongoose = require('mongoose');
const resumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rawText: { type: String },
    skills: [{ type: String }],
    experienceYears: { type: Number },
    role: { type: String },
    summary: { type: String },
    originalFileName: { type: String },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Resume', resumeSchema);
