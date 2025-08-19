const express = require('express');
const QRCode = require('qrcode');
const multer = require('multer');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const { v4: uuidv4 } = require('uuid');
const { auth, authorize } = require('../middleware/auth');
const QRCodeModel = require('../models/QRCode');
const User = require('../models/User');
const router = express.Router();

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Generate random 16-digit code
const generateCode = () => {
  return Math.random().toString(36).substring(2, 18).toUpperCase();
};

// Generate QR codes (Admin only)
router.post('/generate', auth, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const { count } = req.body;
    
    if (!count || count < 1 || count > 100) {
      return res.status(400).json({ message: 'Count must be between 1 and 100' });
    }

    const qrCodes = [];
    
    for (let i = 0; i < count; i++) {
      let code;
      let isUnique = false;
      
      // Ensure unique code
      while (!isUnique) {
        code = generateCode();
        const existingCode = await QRCodeModel.findOne({ code });
        if (!existingCode) {
          isUnique = true;
        }
      }
      
      const qrImage = await QRCode.toDataURL(code, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      
      const qrCodeDoc = new QRCodeModel({
        code,
        qrImage,
        createdBy: req.user._id
      });
      
      await qrCodeDoc.save();
      qrCodes.push(qrCodeDoc);
    }

    res.json({ 
      success: true,
      qrCodes, 
      message: `${count} QR codes generated successfully` 
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ message: 'Error generating QR codes' });
  }
});

// Get all QR codes (Admin/SuperAdmin)
router.get('/all', auth, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const qrCodes = await QRCodeModel.find()
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ message: 'Error fetching QR codes' });
  }
});

// Activate/Deactivate QR code
router.patch('/:id/toggle-active', auth, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    qrCode.isActive = !qrCode.isActive;
    await qrCode.save();

    res.json({ 
      success: true,
      message: `QR code ${qrCode.isActive ? 'activated' : 'deactivated'}`,
      qrCode 
    });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ message: 'Error updating QR code status' });
  }
});

// Assign QR code to user
router.post('/:id/assign', auth, authorize(['admin', 'superadmin']), async (req, res) => {
  try {
    const { userId } = req.body;
    const qrCode = await QRCodeModel.findById(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    if (!qrCode.isActive) {
      return res.status(400).json({ message: 'QR code must be activated before assignment' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    qrCode.assignedTo = userId;
    await qrCode.save();

    res.json({ 
      success: true,
      message: 'QR code assigned successfully',
      qrCode 
    });
  } catch (error) {
    console.error('Assignment error:', error);
    res.status(500).json({ message: 'Error assigning QR code' });
  }
});

// Scan QR code (User)
router.post('/scan', auth, authorize(['user']), upload.single('qrImage'), async (req, res) => {
  try {
    let qrCode;
    
    if (req.file) {
      // Process uploaded image
      const image = await Jimp.read(req.file.buffer);
      const imageData = {
        data: new Uint8ClampedArray(image.bitmap.data),
        height: image.bitmap.height,
        width: image.bitmap.width,
      };
      
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code) {
        return res.status(400).json({ message: 'No QR code found in image' });
      }
      
      qrCode = await QRCodeModel.findOne({ code: code.data });
    } else if (req.body.code) {
      // Manual code entry
      qrCode = await QRCodeModel.findOne({ code: req.body.code });
    } else {
      return res.status(400).json({ message: 'Please provide QR code or upload image' });
    }

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    if (!qrCode.isActive) {
      return res.status(400).json({ message: 'QR code is not activated' });
    }

    // Auto-assign if not already assigned
    if (!qrCode.assignedTo) {
      qrCode.assignedTo = req.user._id;
      await qrCode.save();
    }

    res.json({ 
      success: true,
      qrCode, 
      message: 'QR code scanned successfully' 
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ message: 'Error scanning QR code' });
  }
});

// Get user's QR codes
router.get('/my-codes', auth, authorize(['user']), async (req, res) => {
  try {
    const qrCodes = await QRCodeModel.find({ assignedTo: req.user._id })
      .sort({ createdAt: -1 });
    res.json(qrCodes);
  } catch (error) {
    console.error('Error fetching user QR codes:', error);
    res.status(500).json({ message: 'Error fetching QR codes' });
  }
});

// Update QR code location (API for external updates)
router.patch('/:id/location', auth, authorize(['user']), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Convert to numbers and validate
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid coordinates: must be valid numbers' });
    }
    
    if (lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'Latitude must be between -90 and 90' });
    }
    
    if (lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Longitude must be between -180 and 180' });
    }

    const qrCode = await QRCodeModel.findOne({ 
      _id: req.params.id, 
      assignedTo: req.user._id 
    });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found or not assigned to you' });
    }

    // Update location
    qrCode.location = { latitude: lat, longitude: lng };
    qrCode.lastTracked = new Date();
    
    // Add to tracking history
    qrCode.trackingHistory.push({
      latitude: lat,
      longitude: lng,
      timestamp: new Date()
    });

    await qrCode.save();

    res.json({ 
      success: true,
      message: 'Location updated successfully',
      location: qrCode.location 
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Error updating location' });
  }
});

// Set default location
router.post('/set-default-location', auth, authorize(['user']), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const user = await User.findById(req.user._id);
    user.defaultLocation = { latitude, longitude };
    await user.save();

    res.json({ 
      success: true,
      message: 'Default location set successfully',
      defaultLocation: user.defaultLocation 
    });
  } catch (error) {
    console.error('Default location error:', error);
    res.status(500).json({ message: 'Error setting default location' });
  }
});

// Toggle tracking
router.patch('/:id/toggle-tracking', auth, authorize(['user']), async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findOne({ 
      _id: req.params.id, 
      assignedTo: req.user._id 
    });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    qrCode.isTracking = !qrCode.isTracking;
    await qrCode.save();

    res.json({ 
      success: true,
      message: `Tracking ${qrCode.isTracking ? 'started' : 'stopped'}`,
      isTracking: qrCode.isTracking 
    });
  } catch (error) {
    console.error('Toggle tracking error:', error);
    res.status(500).json({ message: 'Error toggling tracking' });
  }
});

module.exports = router;
