// Dummy data for shopping items
export const categories = [
  { id: 'all', name: 'All', icon: '🛍️', color: '#667eea' },
  { id: 'food', name: 'Food', icon: '🍲', color: '#FF6B6B' },
  { id: 'medicine', name: 'Medicine', icon: '💊', color: '#4ECDC4' },
  { id: 'groceries', name: 'Groceries', icon: '🧺', color: '#45B7D1' }
];

export const foodItems = [
  {
    id: 1, name: 'Dal Makhani', price: 180,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300',
    category: 'food', poweredBy: 'Swiggy',
    description: 'Rich and creamy dal makhani with butter',
    rating: 4.5, deliveryTime: '30-40 mins',
    discount: 10, originalPrice: 200, isVeg: true
  },
  {
    id: 2, name: 'Butter Chicken', price: 250,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300',
    category: 'food', poweredBy: 'Swiggy',
    description: 'Tender chicken in rich tomato gravy',
    rating: 4.7, deliveryTime: '35-45 mins',
    discount: 15, originalPrice: 295, isVeg: false
  },
  {
    id: 3, name: 'Vegetable Biryani', price: 200,
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300',
    category: 'food', poweredBy: 'Swiggy',
    description: 'Aromatic basmati rice with mixed vegetables',
    rating: 4.3, deliveryTime: '40-50 mins',
    discount: 20, originalPrice: 250, isVeg: true
  },
  {
    id: 4, name: 'Rajma Chawal', price: 150,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300',
    category: 'food', poweredBy: 'Swiggy',
    description: 'Kidney beans curry with steamed rice',
    rating: 4.2, deliveryTime: '25-35 mins',
    discount: 5, originalPrice: 160, isVeg: true
  },
  {
    id: 5, name: 'Paneer Butter Masala', price: 220,
    image: 'https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=300',
    category: 'food', poweredBy: 'Swiggy',
    description: 'Cottage cheese in creamy tomato gravy',
    rating: 4.6, deliveryTime: '30-40 mins',
    discount: 12, originalPrice: 250, isVeg: true
  }
];

export const medicineItems = [
  {
    id: 6, name: 'Paracetamol 500mg', price: 25,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
    category: 'medicine', poweredBy: 'PharmEasy',
    description: 'Pain relief and fever reducer tablets',
    prescription: false, quantity: '10 tablets',
    manufacturer: 'Cipla', expiryDate: '2026-12-31'
  },
  {
    id: 7, name: 'Vitamin D3 Capsules', price: 120,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300',
    category: 'medicine', poweredBy: 'PharmEasy',
    description: 'Bone health and immunity supplement',
    prescription: false, quantity: '30 capsules',
    manufacturer: 'HealthKart', expiryDate: '2026-08-15'
  },
  {
    id: 8, name: 'Digital Thermometer', price: 350,
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300',
    category: 'medicine', poweredBy: 'PharmEasy',
    description: 'Digital fever thermometer with LCD display',
    prescription: false, quantity: '1 unit',
    manufacturer: 'Omron', warranty: '2 years'
  },
  {
    id: 9, name: 'Calcium + Vitamin D', price: 80,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300',
    category: 'medicine', poweredBy: 'PharmEasy',
    description: 'Bone strength and density supplement',
    prescription: false, quantity: '30 tablets',
    manufacturer: 'Himalaya', expiryDate: '2026-10-20'
  },
  {
    id: 10, name: 'Blood Pressure Monitor', price: 1500,
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300',
    category: 'medicine', poweredBy: 'PharmEasy',
    description: 'Automatic digital BP monitor',
    prescription: false, quantity: '1 unit',
    manufacturer: 'Dr. Morepen', warranty: '3 years'
  }
];

export const groceryItems = [
  {
    id: 11, name: 'Wheat Flour (Atta)', price: 45,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300',
    category: 'groceries', poweredBy: 'Blinkit',
    description: 'Fresh whole wheat flour for chapatis',
    weight: '1 kg', deliveryTime: '15-20 mins',
    brand: 'Aashirvaad', organic: false
  },
  {
    id: 12, name: 'Basmati Rice', price: 120,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
    category: 'groceries', poweredBy: 'Blinkit',
    description: 'Premium aged basmati rice',
    weight: '1 kg', deliveryTime: '15-20 mins',
    brand: 'India Gate', organic: false
  },
  {
    id: 13, name: 'Fresh Milk', price: 60,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
    category: 'groceries', poweredBy: 'Blinkit',
    description: 'Fresh full cream dairy milk',
    weight: '1 liter', deliveryTime: '10-15 mins',
    brand: 'Amul', organic: false
  },
  {
    id: 14, name: 'Mixed Vegetables', price: 80,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
    category: 'groceries', poweredBy: 'Blinkit',
    description: 'Fresh seasonal mixed vegetables',
    weight: '500g', deliveryTime: '15-20 mins',
    brand: 'Fresh Farm', organic: true
  },
  {
    id: 15, name: 'Cooking Oil', price: 140,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300',
    category: 'groceries', poweredBy: 'Blinkit',
    description: 'Refined sunflower cooking oil',
    weight: '1 liter', deliveryTime: '15-20 mins',
    brand: 'Fortune', organic: false
  },
  {
    id: 16, name: 'Tea Leaves', price: 95,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
    category: 'groceries', poweredBy: 'Blinkit',
    description: 'Premium Assam tea leaves',
    weight: '250g', deliveryTime: '15-20 mins',
    brand: 'Tata Tea', organic: false
  }
];

export const allItems = [...foodItems, ...medicineItems, ...groceryItems];

export const userData = {
  id: '685423370174485af6625655',
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@email.com',
  phone: '+91 9876543210',
  role: 'elderly',
  profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  wallet: { balance: 2500, currency: 'INR' },
  address: {
    street: '123 MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    landmark: 'Near City Mall'
  },
  preferences: { language: 'Hindi', fontSize: 'Large', notifications: true }
};

export const orderHistory = [
  {
    id: 1, orderId: 'ORD001', date: '2024-12-20',
    items: [
      { id: 1, name: 'Dal Makhani', quantity: 1, price: 180, image: foodItems[0].image },
      { id: 6, name: 'Paracetamol', quantity: 1, price: 25, image: medicineItems[0].image }
    ],
    total: 205, status: 'Delivered', deliveredAt: '2024-12-20 14:30', paymentMethod: 'Wallet'
  },
  {
    id: 2, orderId: 'ORD002', date: '2024-12-19',
    items: [
      { id: 11, name: 'Wheat Flour', quantity: 1, price: 45, image: groceryItems[0].image },
      { id: 13, name: 'Fresh Milk', quantity: 2, price: 120, image: groceryItems[2].image }
    ],
    total: 165, status: 'Delivered', deliveredAt: '2024-12-19 11:15', paymentMethod: 'Wallet'
  },
  {
    id: 3, orderId: 'ORD003', date: '2024-12-18',
    items: [
      { id: 2, name: 'Butter Chicken', quantity: 1, price: 250, image: foodItems[1].image }
    ],
    total: 250, status: 'Delivered', deliveredAt: '2024-12-18 19:45', paymentMethod: 'Wallet'
  }
];

export const deliveryAddresses = [
  {
    id: 1, type: 'Home',
    address: '123 MG Road, Mumbai, Maharashtra 400001',
    landmark: 'Near City Mall', isDefault: true
  },
  {
    id: 2, type: 'Office',
    address: '456 Business Park, Andheri, Mumbai 400053',
    landmark: 'Tower B, 5th Floor', isDefault: false
  }
];

// ✅ Default export
export default {
  categories,
  foodItems,
  medicineItems,
  groceryItems,
  allItems,
  userData,
  orderHistory,
  deliveryAddresses
};
