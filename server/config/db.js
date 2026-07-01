const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Override DNS servers to ensure MongoDB Atlas SRV records resolve correctly
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (dnsErr) {
      console.warn('⚠️ DNS server override warning:', dnsErr.message);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    // process.exit(1); 
  }
};

module.exports = connectDB;
