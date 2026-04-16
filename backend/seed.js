const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load .env file
dotenv.config();

console.log('🔍 Checking environment...');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

// Medicine Schema
const medicineSchema = new mongoose.Schema({
  name: String,
  batchNumber: String,
  expiryDate: Date,
  price: Number,
  gst: Number,
  quantity: Number,
  company: String
});

const User = mongoose.model('User', userSchema);
const Medicine = mongoose.model('Medicine', medicineSchema);

const users = [
  {
    name: 'Admin User',
    email: 'admin@medical.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Staff User',
    email: 'staff@medical.com',
    password: 'staff123',
    role: 'staff'
  }
];

const medicines = [
  {
    name: "Paracetamol 500mg",
    batchNumber: "PCM-001",
    expiryDate: new Date("2025-12-31"),
    price: 25.00,
    gst: 12,
    quantity: 100,
    company: "Cipla"
  },
  {
    name: "Amoxicillin 250mg",
    batchNumber: "AMX-002",
    expiryDate: new Date("2025-10-31"),
    price: 45.00,
    gst: 12,
    quantity: 5,
    company: "GSK"
  },
  {
    name: "Vitamin C 500mg",
    batchNumber: "VTC-003",
    expiryDate: new Date("2026-01-31"),
    price: 35.00,
    gst: 5,
    quantity: 150,
    company: "Abbott"
  },
  {
    name: "Cetrizine 10mg",
    batchNumber: "CTZ-004",
    expiryDate: new Date("2025-09-30"),
    price: 30.00,
    gst: 12,
    quantity: 3,
    company: "Sun Pharma"
  },
  {
    name: "Omeprazole 20mg",
    batchNumber: "OMZ-005",
    expiryDate: new Date("2025-11-30"),
    price: 55.00,
    gst: 12,
    quantity: 60,
    company: "Dr Reddy's"
  }
];

async function seedDatabase() {
  try {
    console.log('\n📡 Connecting to MongoDB Atlas...');
    console.log(`URI: ${process.env.MONGODB_URI}`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Clear existing data
    await User.deleteMany({});
    await Medicine.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Create users with hashed passwords
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        ...user,
        password: hashedPassword
      });
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }
    
    // Insert medicines
    await Medicine.insertMany(medicines);
    console.log(`✅ Inserted ${medicines.length} medicines`);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━'.repeat(50));
    console.log('👨‍💼 Admin User:');
    console.log('   Email: admin@medical.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👨‍💻 Staff User:');
    console.log('   Email: staff@medical.com');
    console.log('   Password: staff123');
    console.log('━'.repeat(50));
    
    await mongoose.disconnect();
    console.log('\n✅ Setup complete! You can now start your backend with: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.log('\n⚠️  Authentication failed! Check your username and password in MONGODB_URI');
    } else if (error.message.includes('getaddrinfo')) {
      console.log('\n⚠️  Network error! Check your internet connection and MongoDB Atlas cluster status');
    }
    
    process.exit(1);
  }
}

seedDatabase();