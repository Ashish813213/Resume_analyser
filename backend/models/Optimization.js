const mongoose = require('mongoose');
const optimizationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalText: { type: String, required: true },
    optimizedText: { type: String },
    jobDescription: { type: String },
    jobUrl: { type: String },
    atsScore: { type: Number, default: 0 },
    suggestions: [{ type: String }],
    skillGaps: [{ type: String }],
    matchedSkills: [{ type: String }],
    keywordDensity: {
        total: { type: Number, default: 0 },
        matched: { type: Number, default: 0 },
        missing: [{ type: String }]
    },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'completed', 'failed'], 
        default: 'pending' 
    },
    processingMethod: { type: String, default: 'bytez' },
    originalFileName: { type: String },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});
module.exports = mongoose.model('Optimization', optimizationSchema);
