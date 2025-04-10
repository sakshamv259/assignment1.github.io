const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10
        };

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

        await mongoose.connect(process.env.MONGODB_URI, options);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Wait 5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
        return connectDB();
    }
};

module.exports = connectDB; 