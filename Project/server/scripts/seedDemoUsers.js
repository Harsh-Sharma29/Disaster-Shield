/**
 * Demo Users Seeder Script
 * Creates demo users for testing authentication and different role capabilities
 */
import { connectDB } from '../db.js';
import User from '../models/User.js';

const demoUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@demo.com',
    username: 'admin_demo',
    password: 'Admin123!',
    role: 'admin',
    phone: '+1-555-0001',
    status: 'active',
    auth: {
      emailVerified: true
    },
    profile: {
      organization: 'DisasterShield System',
      department: 'Administration',
      position: 'System Administrator',
      bio: 'System administrator with full access to all disaster management features.'
    },
    location: {
      coordinates: {
        type: 'Point',
        coordinates: [-74.0059, 40.7128] // New York City
      },
      address: {
        city: 'New York',
        state: 'New York',
        country: 'United States',
        formatted: 'New York, NY, USA'
      }
    }
  },
  {
    firstName: 'Emergency',
    lastName: 'Coordinator',
    email: 'coordinator@demo.com',
    username: 'coord_demo',
    password: 'Coord123!',
    role: 'coordinator',
    phone: '+1-555-0002',
    status: 'active',
    auth: {
      emailVerified: true
    },
    profile: {
      organization: 'Emergency Management Agency',
      department: 'Emergency Response',
      position: 'Emergency Coordinator',
      bio: 'Experienced emergency coordinator responsible for disaster response coordination.',
      skills: ['Emergency Planning', 'Resource Management', 'Crisis Communication']
    },
    location: {
      coordinates: {
        type: 'Point',
        coordinates: [-118.2437, 34.0522] // Los Angeles
      },
      address: {
        city: 'Los Angeles',
        state: 'California',
        country: 'United States',
        formatted: 'Los Angeles, CA, USA'
      }
    }
  },
  {
    firstName: 'First',
    lastName: 'Responder',
    email: 'responder@demo.com',
    username: 'responder_demo',
    password: 'Respond123!',
    role: 'responder',
    phone: '+1-555-0003',
    status: 'active',
    auth: {
      emailVerified: true
    },
    profile: {
      organization: 'City Fire Department',
      department: 'Emergency Services',
      position: 'Fire Captain',
      bio: 'Experienced first responder with 10+ years in emergency services.',
      skills: ['Fire Suppression', 'Emergency Medical Response', 'Rescue Operations'],
      certifications: [
        {
          name: 'EMT-Paramedic',
          issuedBy: 'National Registry',
          issuedDate: new Date('2020-01-15'),
          expiryDate: new Date('2025-01-15')
        }
      ]
    },
    location: {
      coordinates: {
        type: 'Point',
        coordinates: [-87.6298, 41.8781] // Chicago
      },
      address: {
        city: 'Chicago',
        state: 'Illinois',
        country: 'United States',
        formatted: 'Chicago, IL, USA'
      }
    }
  },
  {
    firstName: 'Community',
    lastName: 'Volunteer',
    email: 'volunteer@demo.com',
    username: 'volunteer_demo',
    password: 'Volunteer123!',
    role: 'volunteer',
    phone: '+1-555-0004',
    status: 'active',
    auth: {
      emailVerified: true
    },
    profile: {
      organization: 'Community Emergency Response Team',
      department: 'Volunteer Services',
      position: 'Team Leader',
      bio: 'Dedicated community volunteer helping with disaster preparedness and response.',
      skills: ['Community Outreach', 'First Aid', 'Emergency Communication']
    },
    location: {
      coordinates: {
        type: 'Point',
        coordinates: [-95.3698, 29.7604] // Houston
      },
      address: {
        city: 'Houston',
        state: 'Texas',
        country: 'United States',
        formatted: 'Houston, TX, USA'
      }
    }
  },
  {
    firstName: 'John',
    lastName: 'Citizen',
    email: 'citizen@demo.com',
    username: 'citizen_demo',
    password: 'Citizen123!',
    role: 'citizen',
    phone: '+1-555-0005',
    status: 'active',
    auth: {
      emailVerified: true
    },
    profile: {
      bio: 'Regular citizen interested in staying informed about local emergency situations.',
      emergencyContact: {
        name: 'Jane Citizen',
        relationship: 'Spouse',
        phone: '+1-555-0006',
        email: 'jane@example.com'
      }
    },
    location: {
      coordinates: {
        type: 'Point',
        coordinates: [-80.1918, 25.7617] // Miami
      },
      address: {
        city: 'Miami',
        state: 'Florida',
        country: 'United States',
        formatted: 'Miami, FL, USA'
      }
    },
    preferences: {
      notifications: {
        email: {
          enabled: true,
          alerts: true,
          incidents: false
        },
        push: {
          enabled: true,
          alerts: true,
          incidents: true
        }
      },
      alerts: {
        radius: 15,
        severityLevels: ['moderate', 'severe', 'extreme'],
        categories: ['weather', 'flood', 'fire']
      }
    }
  }
];

async function seedDemoUsers() {
  try {
    console.log('🌱 Starting demo users seeding...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing demo users
    const deleteResult = await User.deleteMany({
      email: { $in: demoUsers.map(user => user.email) }
    });
    console.log(`🗑️  Removed ${deleteResult.deletedCount} existing demo users`);

    // Create demo users
    const createdUsers = [];
    for (const userData of demoUsers) {
      try {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`✅ Created demo user: ${user.email} (${user.role})`);
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully created ${createdUsers.length} demo users!`);
    console.log('\n📋 Demo User Credentials:');
    console.log('================================');
    
    demoUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}`);
      console.log('');
    });

    console.log('💡 You can now use these credentials to test different user roles and permissions.');
    console.log('🔐 All demo accounts have email verification enabled.');
    
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run the seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoUsers();
}

export default seedDemoUsers;
