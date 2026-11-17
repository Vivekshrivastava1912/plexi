const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

const seedDefaultData = async () => {
  try {
    const defaultEmail = (process.env.DEFAULT_USER_EMAIL || 'admin@example.com').toLowerCase().trim();
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'admin123';
    const defaultName = process.env.DEFAULT_USER_NAME || 'Admin User';

    // Check if default user exists
    let user = await User.findOne({ email: defaultEmail });
    if (!user) {
      user = await User.create({
        name: defaultName,
        email: defaultEmail,
        password: defaultPassword,
        role: 'admin',
      });
      console.log(`[Seed] Default test user created successfully:`);
      console.log(`       Email:    ${defaultEmail}`);
      console.log(`       Password: ${defaultPassword}`);
    } else {
      console.log(`[Seed] Default user (${defaultEmail}) already exists.`);
    }

    // Seed sample tickets if database has no tickets yet
    const ticketCount = await Ticket.countDocuments();
    if (ticketCount === 0) {
      const sampleTickets = [
        {
          ticketId: 'TCK-1001',
          customerName: 'Alice Johnson',
          customerEmail: 'alice.johnson@techcorp.com',
          subject: 'Payment gateway timeout during checkout',
          description: 'Customer reported an error code 504 when attempting Stripe card payment on the checkout page.',
          priority: 'High',
          status: 'Open',
          createdBy: user._id,
        },
        {
          ticketId: 'TCK-1002',
          customerName: 'Robert Smith',
          customerEmail: 'robert.smith@cloudmail.io',
          subject: 'Unable to reset account password',
          description: 'The password reset verification link sent to user inbox expired prematurely or fails with invalid token.',
          priority: 'Medium',
          status: 'In Progress',
          createdBy: user._id,
        },
        {
          ticketId: 'TCK-1003',
          customerName: 'Emily Davis',
          customerEmail: 'emily.d@innovate.org',
          subject: 'Feature Request: Dark mode UI theme',
          description: 'User requested a dark theme toggle for the dashboard to reduce eye strain during nighttime shifts.',
          priority: 'Low',
          status: 'Resolved',
          createdBy: user._id,
        },
        {
          ticketId: 'TCK-1004',
          customerName: 'Michael Brown',
          customerEmail: 'michael.b@enterprises.net',
          subject: 'Data export to CSV failing with 500 error',
          description: 'Exporting large ticket datasets (>500 items) causes the server to time out and return a 500 status code.',
          priority: 'High',
          status: 'Open',
          createdBy: user._id,
        },
      ];

      await Ticket.insertMany(sampleTickets);
      console.log(`[Seed] Seeded ${sampleTickets.length} initial sample tickets.`);
    }
  } catch (error) {
    console.error('[Seed] Error during seeding:', error.message);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/support_ticket_db';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    await seedDefaultData();
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn(`[MongoDB] Please make sure MongoDB is running locally on port 27017 or provide a valid MONGODB_URI in server/.env`);
  }
};

module.exports = connectDB;

