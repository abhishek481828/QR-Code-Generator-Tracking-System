const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const QRCodeModel = require('../models/QRCode');
const router = express.Router();

// Get all users
router.get('/users', auth, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get dashboard statistics
router.get('/dashboard', auth, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalQRCodes = await QRCodeModel.countDocuments();
    const activeQRCodes = await QRCodeModel.countDocuments({ isActive: true });
    const assignedQRCodes = await QRCodeModel.countDocuments({ assignedTo: { $ne: null } });
    const trackingQRCodes = await QRCodeModel.countDocuments({ isTracking: true });

    res.json({
      totalUsers,
      totalQRCodes,
      activeQRCodes,
      assignedQRCodes,
      trackingQRCodes
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get recent activities
router.get('/activities', auth, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const recentQRCodes = await QRCodeModel.find()
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json(recentQRCodes);
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

module.exports = router;
