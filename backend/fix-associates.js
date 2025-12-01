const mongoose = require('mongoose');
require('dotenv').config();

const Associate = require('./models/Associate');

async function fixAssociates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log('✅ Connected to MongoDB');

    // 1. Drop any unique index on email field
    try {
      const collection = mongoose.connection.collection('associates');
      const indexes = await collection.indexes();
      console.log('📋 Current indexes:', indexes);

      // Drop any unique index on email
      for (const index of indexes) {
        if (index.key.email && index.unique) {
          console.log('🗑️ Dropping unique index on email:', index.name);
          await collection.dropIndex(index.name);
        }
      }
    } catch (error) {
      console.log('ℹ️ No unique email index to drop or error:', error.message);
    }

    // 2. Update all associates with empty strings to undefined
    const result = await Associate.updateMany(
      { 
        $or: [
          { email: '' },
          { company: '' },
          { phone: '' }
        ]
      },
      {
        $unset: {
          email: '',
          company: '',
          phone: ''
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} associates - converted empty strings to undefined`);

    // 3. Recreate the sparse index (allows multiple documents with undefined email)
    await Associate.collection.createIndex({ email: 1 }, { sparse: true });
    console.log('✅ Created sparse index on email field');

    // 4. Show summary
    const total = await Associate.countDocuments();
    const withEmail = await Associate.countDocuments({ email: { $exists: true, $ne: null } });
    const withoutEmail = total - withEmail;

    console.log('\n📊 Summary:');
    console.log(`   Total associates: ${total}`);
    console.log(`   With email: ${withEmail}`);
    console.log(`   Without email: ${withoutEmail}`);

    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixAssociates();
