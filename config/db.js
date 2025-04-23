const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Log successful connection
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    // Log connection errors
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    // Log disconnection
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from DB');
    });

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('MongoDB URI:', process.env.MONGODB_URI);
    throw error; // Re-throw the error to be handled by the server
  }
};

module.exports = connectDB;
