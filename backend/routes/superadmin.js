const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const QRCodeModel = require('../models/QRCode');
const router = express.Router();

// Get all users including admins
router.get('/users', auth, authorize(['superadmin']), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Delete user
router.delete('/users/:id', auth, authorize(['superadmin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting superadmin
    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot delete superadmin' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    // Also unassign any QR codes assigned to this user
    await QRCodeModel.updateMany(
      { assignedTo: req.params.id },
      { assignedTo: null }
    );

    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Update user
router.patch('/users/:id', auth, authorize(['superadmin']), async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow changing superadmin role
    if (user.role === 'superadmin' && role !== 'superadmin') {
      return res.status(400).json({ message: 'Cannot change superadmin role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete QR code
router.delete('/qrcodes/:id', auth, authorize(['superadmin']), async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    await QRCodeModel.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'QR code deleted successfully' 
    });
  } catch (error) {
    console.error('Delete QR code error:', error);
    res.status(500).json({ message: 'Error deleting QR code' });
  }
});

// Get system statistics
router.get('/system-stats', auth, authorize(['superadmin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalRegularUsers = await User.countDocuments({ role: 'user' });
    const totalQRCodes = await QRCodeModel.countDocuments();
    const activeQRCodes = await QRCodeModel.countDocuments({ isActive: true });
    const assignedQRCodes = await QRCodeModel.countDocuments({ assignedTo: { $ne: null } });
    const trackingQRCodes = await QRCodeModel.countDocuments({ isTracking: true });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      totalQRCodes,
      activeQRCodes,
      assignedQRCodes,
      trackingQRCodes,
      recentRegistrations
    });
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({ message: 'Error fetching system statistics' });
  }
});

module.exports = router;
