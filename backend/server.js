const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('Connected to local MongoDB');
    } catch (err) {
        console.warn('Local MongoDB connection failed. Attempting to start embedded MongoDB (Persistent)...');
        try {
            const dbPath = path.join(__dirname, 'mongo_data');
            if (!fs.existsSync(dbPath)) {
                fs.mkdirSync(dbPath, { recursive: true });
            }
            const mongod = await MongoMemoryServer.create({
                instance: {
                    dbPath: dbPath,
                    storageEngine: 'wiredTiger' 
                }
            });
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('Connected to Embedded MongoDB. Data will be saved in ./mongo_data');
        } catch (fallbackErr) {
            console.error('Failed to start embedded MongoDB:', fallbackErr);
            process.exit(1);
        }
    }
};
connectDB();
app.use(express.json());
app.use(cors());
const authRoute = require('./routes/authRoutes');
const resumeRoute = require('./routes/resumeRoutes');
const optimizeRoute = require('./routes/optimizeRoutes');
app.use('/api/user', authRoute);
app.use('/api/resume', resumeRoute);
app.use('/api/optimize', optimizeRoute);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Up and Running on port ${PORT}`));
