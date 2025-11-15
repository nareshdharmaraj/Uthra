// Test script to add a sample crop
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Sample crop data matching frontend expectations
const sampleCrop = {
  name: 'Tomato',
  category: 'vegetables',
  quantity: {
    value: 500,
    unit: 'kg'
  },
  availableQuantity: {
    value: 500,
    unit: 'kg'
  },
  price: {
    value: 25,
    unit: 'per_kg'
  },
  description: 'Fresh organic tomatoes, harvested daily. Perfect for cooking and salads.',
  availableFrom: '2025-11-15',
  availableTo: '2025-12-31',
  organicCertified: true,
  qualityGrade: 'Grade A',
  pickupLocation: {
    district: 'Karur',
    state: 'Tamil Nadu'
  }
};

async function loginAndAddCrop() {
  try {
    console.log('🔐 Step 1: Logging in as farmer...');
    
    // Login with farmer credentials
    // You need to replace these with actual farmer credentials from your database
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      mobile: '1234567890', // Replace with actual farmer mobile
      password: 'password123' // Replace with actual password
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log('Token:', token.substring(0, 20) + '...');

    console.log('\n🌾 Step 2: Adding sample crop...');
    console.log('Crop data:', JSON.stringify(sampleCrop, null, 2));

    // Add crop with authentication
    const cropResponse = await axios.post(
      `${API_BASE_URL}/farmers/crops`,
      sampleCrop,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Crop added successfully!');
    console.log('Response:', JSON.stringify(cropResponse.data, null, 2));

    // Fetch all crops to verify
    console.log('\n📋 Step 3: Fetching all crops...');
    const cropsResponse = await axios.get(`${API_BASE_URL}/farmers/crops`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Total crops:', cropsResponse.data.total);
    console.log('Crops:', JSON.stringify(cropsResponse.data.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Alternative: Direct database insertion (if login doesn't work)
async function addCropDirectly() {
  console.log('⚠️  If login doesn\'t work, you can add crop directly via MongoDB:');
  console.log('\nRun this in MongoDB shell or Compass:');
  console.log(`
db.crops.insertOne({
  farmer: ObjectId("YOUR_FARMER_ID_HERE"),
  name: "Tomato",
  category: "vegetables",
  quantity: { value: 500, unit: "kg" },
  availableQuantity: { value: 500, unit: "kg" },
  price: { value: 25, unit: "per_kg" },
  description: "Fresh organic tomatoes, harvested daily. Perfect for cooking and salads.",
  availableFrom: new Date("2025-11-15"),
  availableTo: new Date("2025-12-31"),
  organicCertified: true,
  quality: "grade_a",
  pickupLocation: {
    district: "Karur",
    state: "Tamil Nadu"
  },
  status: "active",
  isVisible: true,
  entryMethod: "web",
  createdAt: new Date(),
  updatedAt: new Date()
})
  `);
}

console.log('🚀 Starting crop addition test...\n');
loginAndAddCrop();
console.log('\n' + '='.repeat(60));
addCropDirectly();
