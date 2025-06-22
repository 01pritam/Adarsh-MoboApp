// // routes/orders.js
// const express = require('express');
// const router = express.Router();
// const { 
//   placeOrder, 
//   getUserOrders, 
//   getOrderById, 
//   updateOrderStatus 
// } = require('../controllers/orderController');
// const auth = require('../middleware/auth');

// // Order routes
// router.post('/', auth, placeOrder);
// router.get('/', auth, getUserOrders);
// router.get('/:orderId', auth, getOrderById);
// router.put('/:orderId/status', auth, updateOrderStatus);

// module.exports = router;




// routes/orders.js
const express = require('express');
const router = express.Router();
const { 
  placeOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController');
const auth = require('../middleware/auth');

// ✅ Place a new order
router.post('/', auth, placeOrder);

// ✅ Get all orders for authenticated user
router.get('/', auth, getUserOrders);

// ✅ Get order statistics
router.get('/stats', auth, getOrderStats);

// ✅ Get specific order by orderId
router.get('/:orderId', auth, getOrderById);

// ✅ Update order status (for admin/delivery)
router.put('/:orderId/status', auth, updateOrderStatus);

// ✅ Cancel an order
router.put('/:orderId/cancel', auth, cancelOrder);

module.exports = router;
