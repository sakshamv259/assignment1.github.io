const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            retryWrites: true,
            w: 'majority'
        };

        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        
        console.log('Attempting to connect to MongoDB...');
        console.log('Connection string format verified ✓');
        
        await mongoose.connect(uri, options);
        console.log('MongoDB connected successfully ✓');

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err.message);
            console.error('Full error:', JSON.stringify(err, null, 2));
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });

    } catch (error) {
        console.error('MongoDB connection error details:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Name:', error.name);
        if (error.reason) {
            console.error('Reason:', JSON.stringify(error.reason, null, 2));
        }
        // Retry connection after 5 seconds
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB; 