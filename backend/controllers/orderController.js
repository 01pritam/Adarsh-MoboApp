// const Order = require('../models/order');
// const User = require('../models/user');
// const UserProfile = require('../models/profile');
// const Transaction = require('../models/transaction');
// const mongoose = require('mongoose');

// // Place order
// const placeOrder = async (req, res) => {
//   const session = await mongoose.startSession();
  
//   try {
//     const userId = req.user.userId;
//     const { 
//       items, 
//       totalAmount, 
//       paymentMethod = 'wallet',
//       deliveryAddress,
//       specialInstructions,
//       voiceOrderId,
//       originalTranscript
//     } = req.body;

//     console.log('🛒 Placing order for user:', userId);
//     console.log('🛒 Order details:', { items: items.length, totalAmount, paymentMethod });

//     await session.withTransaction(async () => {
//       // Get user and profile
//       const [user, profile] = await Promise.all([
//         User.findById(userId).session(session),
//         UserProfile.findOne({ userId }).session(session)
//       ]);

//       if (!user || !profile) {
//         throw new Error('User or profile not found');
//       }

//       // Check wallet balance if payment method is wallet
//       if (paymentMethod === 'wallet') {
//         if (profile.wallet.balance < totalAmount) {
//           throw new Error(`Insufficient wallet balance. Required: ₹${totalAmount}, Available: ₹${profile.wallet.balance}`);
//         }
//       }

//       // Create order
//       const order = new Order({
//         userId,
//         items: items.map(item => ({
//           productId: item.id,
//           name: item.name,
//           price: item.price,
//           quantity: item.quantity || 1,
//           image: item.image,
//           category: item.category,
//           poweredBy: item.poweredBy
//         })),
//         totalAmount,
//         paymentMethod,
//         deliveryAddress: deliveryAddress || {
//           street: profile.address.street,
//           city: profile.address.city,
//           state: profile.address.state,
//           zipCode: profile.address.zipCode
//         },
//         specialInstructions,
//         voiceOrderId,
//         originalTranscript,
//         placedViaVoice: !!voiceOrderId,
//         contactNumber: user.phoneNumber,
//         status: 'confirmed',
//         confirmedAt: new Date()
//       });

//       // Deduct from wallet if payment method is wallet
//       if (paymentMethod === 'wallet') {
//         profile.wallet.balance -= totalAmount;
//         profile.wallet.lastTransactionAt = new Date();

//         // Create transaction record
//         const transaction = new Transaction({
//           fromUser: userId,
//           type: 'debit',
//           category: 'shopping',
//           amount: totalAmount,
//           description: `Order payment for ${order.orderId}`,
//           paymentMethod: 'wallet',
//           balanceBefore: {
//             fromUserBalance: profile.wallet.balance + totalAmount
//           },
//           balanceAfter: {
//             fromUserBalance: profile.wallet.balance
//           },
//           metadata: {
//             orderId: order.orderId,
//             itemCount: items.length,
//             orderType: voiceOrderId ? 'voice_order' : 'manual_order'
//           },
//           status: 'completed',
//           completedAt: new Date()
//         });

//         await transaction.save({ session });
//       }

//       // Save order and profile
//       await Promise.all([
//         order.save({ session }),
//         profile.save({ session })
//       ]);

//       res.status(200).json({
//         success: true,
//         message: 'Order placed successfully',
//         data: {
//           orderId: order.orderId,
//           estimatedDelivery: order.estimatedDelivery,
//           totalAmount: order.totalAmount,
//           status: order.status,
//           items: order.items,
//           newWalletBalance: profile.wallet.balance
//         }
//       });
//     });

//   } catch (error) {
//     console.error('💥 Error placing order:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error placing order'
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // Get user orders
// const getUserOrders = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { page = 1, limit = 20, status } = req.query;

//     console.log('📦 Getting orders for user:', userId);

//     const orders = await Order.getUserOrders(userId, { page, limit, status });
//     const totalOrders = await Order.countDocuments({ userId });

//     res.status(200).json({
//       success: true,
//       message: 'Orders retrieved successfully',
//       data: {
//         orders,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(totalOrders / limit),
//           totalOrders,
//           hasMore: (page * limit) < totalOrders
//         }
//       }
//     });

//   } catch (error) {
//     console.error('💥 Error getting orders:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error retrieving orders'
//     });
//   }
// };

// // Get order by ID
// const getOrderById = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const userId = req.user.userId;

//     const order = await Order.findOne({ orderId, userId })
//       .populate('userId', 'name email phoneNumber');

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: { order }
//     });

//   } catch (error) {
//     console.error('💥 Error getting order:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error retrieving order'
//     });
//   }
// };

// // Update order status
// const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;

//     const order = await Order.findOne({ orderId });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     order.status = status;
    
//     if (status === 'delivered') {
//       order.deliveredAt = new Date();
//     }

//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: 'Order status updated successfully',
//       data: { order }
//     });

//   } catch (error) {
//     console.error('💥 Error updating order status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating order status'
//     });
//   }
// };

// module.exports = {
//   placeOrder,
//   getUserOrders,
//   getOrderById,
//   updateOrderStatus
// };



// controllers/orderController.js
const Order = require('../models/order');
const User = require('../models/user');
const UserProfile = require('../models/profile');
const Transaction = require('../models/transaction');
const mongoose = require('mongoose');

// ✅ Place order
const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const userId = req.user.userId;
    const { 
      items, 
      totalAmount, 
      paymentMethod = 'wallet',
      deliveryAddress,
      specialInstructions,
      voiceOrderId,
      originalTranscript
    } = req.body;

    console.log('🛒 Placing order for user:', userId);
    console.log('🛒 Order details:', { 
      itemsCount: items.length, 
      totalAmount, 
      paymentMethod 
    });

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount'
      });
    }

    await session.withTransaction(async () => {
      // Get user and profile
      const [user, profile] = await Promise.all([
        User.findById(userId).session(session),
        UserProfile.findOne({ userId }).session(session)
      ]);

      if (!user || !profile) {
        throw new Error('User or profile not found');
      }

      // Check wallet balance if payment method is wallet
      if (paymentMethod === 'wallet') {
        if (profile.wallet.balance < totalAmount) {
          throw new Error(`Insufficient wallet balance. Required: ₹${totalAmount}, Available: ₹${profile.wallet.balance}`);
        }
      }

      // Create order
      const order = new Order({
        userId,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image,
          category: item.category,
          poweredBy: item.poweredBy
        })),
        totalAmount,
        paymentMethod,
        deliveryAddress: deliveryAddress || {
          street: profile.address.street,
          city: profile.address.city,
          state: profile.address.state,
          zipCode: profile.address.zipCode,
          landmark: profile.address.landmark
        },
        specialInstructions,
        voiceOrderId,
        originalTranscript,
        placedViaVoice: !!voiceOrderId,
        contactNumber: user.phoneNumber,
        status: 'confirmed',
        confirmedAt: new Date(),
        estimatedDelivery: getEstimatedDelivery(items)
      });

      // Deduct from wallet if payment method is wallet
      if (paymentMethod === 'wallet') {
        profile.wallet.balance -= totalAmount;
        profile.wallet.lastTransactionAt = new Date();

        // Create transaction record
        const transaction = new Transaction({
          fromUser: userId,
          type: 'debit',
          category: 'shopping',
          amount: totalAmount,
          description: `Order payment for ${order.orderId}`,
          paymentMethod: 'wallet',
          balanceBefore: {
            fromUserBalance: profile.wallet.balance + totalAmount
          },
          balanceAfter: {
            fromUserBalance: profile.wallet.balance
          },
          metadata: {
            orderId: order.orderId,
            itemCount: items.length,
            orderType: voiceOrderId ? 'voice_order' : 'manual_order'
          },
          status: 'completed',
          completedAt: new Date()
        });

        await transaction.save({ session });
      }

      // Save order and profile
      await Promise.all([
        order.save({ session }),
        profile.save({ session })
      ]);

      console.log('✅ Order placed successfully:', order.orderId);

      res.status(200).json({
        success: true,
        message: 'Order placed successfully',
        data: {
          orderId: order.orderId,
          estimatedDelivery: order.estimatedDelivery,
          totalAmount: order.totalAmount,
          status: order.status,
          items: order.items,
          newWalletBalance: profile.wallet.balance
        }
      });
    });

  } catch (error) {
    console.error('💥 Error placing order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error placing order'
    });
  } finally {
    await session.endSession();
  }
};

// ✅ Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 20, 
      status,
      category 
    } = req.query;

    console.log('📦 Getting orders for user:', userId);

    // Build query
    const query = { userId };
    if (status) query.status = status;
    if (category) query['items.category'] = category;

    const orders = await Order.find(query)
      .populate('userId', 'name email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasMore: (page * limit) < totalOrders
        }
      }
    });

  } catch (error) {
    console.error('💥 Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving orders'
    });
  }
};

// ✅ Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ orderId, userId })
      .populate('userId', 'name email phoneNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('💥 Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving order'
    });
  }
};

// ✅ Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryNote } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.actualDeliveryTime = new Date();
    }

    if (deliveryNote) {
      order.specialInstructions = deliveryNote;
    }

    await order.save();

    console.log('✅ Order status updated:', orderId, 'to', status);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('💥 Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
};

// ✅ Cancel order
const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    await session.withTransaction(async () => {
      const order = await Order.findOne({ orderId, userId }).session(session);

      if (!order) {
        throw new Error('Order not found');
      }

      if (['delivered', 'cancelled'].includes(order.status)) {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }

      // Refund to wallet if paid via wallet
      if (order.paymentMethod === 'wallet' && order.paymentStatus === 'completed') {
        const profile = await UserProfile.findOne({ userId }).session(session);
        
        if (profile) {
          profile.wallet.balance += order.totalAmount;
          profile.wallet.lastTransactionAt = new Date();

          // Create refund transaction
          const refundTransaction = new Transaction({
            fromUser: userId,
            type: 'credit',
            category: 'refund',
            amount: order.totalAmount,
            description: `Refund for cancelled order ${order.orderId}`,
            paymentMethod: 'wallet',
            balanceBefore: {
              fromUserBalance: profile.wallet.balance - order.totalAmount
            },
            balanceAfter: {
              fromUserBalance: profile.wallet.balance
            },
            metadata: {
              orderId: order.orderId,
              cancellationReason: reason
            },
            status: 'completed',
            completedAt: new Date()
          });

          await Promise.all([
            profile.save({ session }),
            refundTransaction.save({ session })
          ]);
        }
      }

      // Update order status
      order.status = 'cancelled';
      order.cancellationReason = reason;
      order.cancelledAt = new Date();

      await order.save({ session });

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: { 
          order,
          refunded: order.paymentMethod === 'wallet'
        }
      });
    });

  } catch (error) {
    console.error('💥 Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling order'
    });
  } finally {
    await session.endSession();
  }
};

// ✅ Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = '30d' } = req.query;

    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    const stats = await Order.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      avgOrderValue: 0
    };

    res.status(200).json({
      success: true,
      data: {
        period,
        stats: result
      }
    });

  } catch (error) {
    console.error('💥 Error getting order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving order statistics'
    });
  }
};

// ✅ Helper function to calculate estimated delivery
const getEstimatedDelivery = (items) => {
  const categories = items.map(item => item.category);
  
  if (categories.includes('food')) {
    return '30-45 mins';
  } else if (categories.includes('medicine')) {
    return '1-2 hours';
  } else if (categories.includes('groceries')) {
    return '15-30 mins';
  }
  
  return '30-60 mins';
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
};
