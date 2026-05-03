const mongoose = require('mongoose');
const jobMatchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobDescription: { type: String, required: true },
    extractedSkills: [{ type: String }],
    matchScore: { type: Number },
    missingSkills: [{ type: String }],
    matchedSkills: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('JobMatch', jobMatchSchema);
