// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const Order = require('../models/Order'); // your Sequelize Order model

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/artwork/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (['image/jpeg', 'image/jpg'].includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only JPEG files are allowed'), false);
//   }
// };

// const upload = multer({ storage, fileFilter });

// // Route to upload and save artwork file path to Order
// router.post('/upload-artwork/:orderId', upload.single('artwork'), async (req, res) => {
//   const { orderId } = req.params;

//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   try {
//     const filePath = `/uploads/artwork/${req.file.filename}`;

//     const order = await Order.findByPk(orderId);
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     order.attachApprovedArtwork = filePath;
//     await order.save();

//     res.json({
//       message: 'Artwork uploaded and saved successfully',
//       filePath,
//     });
//   } catch (err) {
//     console.error('Upload Error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
