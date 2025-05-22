const express = require("express");
const router = express.Router();
const db = require('../config/db'); // Sequelize connection
const multer = require("multer");
const path = require("path");
const { QueryTypes } = require('sequelize');

const safeValue = (v) => (v !== undefined && v !== '' ? v : null);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage: storage });
  

// POST new order using Sequelize Model (optional)
const Order = require("../models/Order");
router.post("/", async(req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// GET all orders
router.get("/orders", async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const orders = await db.query(
            `SELECT SQL_CALC_FOUND_ROWS * FROM orders ORDER BY id DESC LIMIT :limit OFFSET :offset`, {
                replacements: { limit, offset },
                type: QueryTypes.SELECT,
                raw: true,
            }
        );

        const totalResult = await db.query("SELECT FOUND_ROWS() AS total", {
            type: QueryTypes.SELECT,
        });
        const total = totalResult[0].total;

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (err) {
        console.error("Failed to fetch paginated orders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});


// router.get("/concerned-persons", async(req, res) => {
//     try {
//         const persons = await Order.findAll({
//             attributes: ['concernedPerson'],
//             group: ['concernedPerson']
//         });
//         res.json(persons);
//     } catch (err) {
//         res.status(500).json({ error: "Failed to fetch concerned persons." });
//     }
// });

// const { Order, Signup } = require('../models');

// Route: /api/concerned-persons

router.get("/concerned-persons", async (req, res) => {
    try {
        const [results] = await db.query(
            "SELECT emp_id, fullName FROM signups WHERE type='user'"
        );
        res.json(results);
    } catch (err) {
        console.error("Error fetching concerned persons:", err);
        res.status(500).json({ error: "Failed to fetch concerned persons." });
    }
});




// Save Progress (Insert or Update)
router.post('/saveProgress', upload.single("artwork"), async(req, res) => {
    const data = req.body;
    console.log(data)

    const artworkFilename = req.file?.filename || null;
    console.log(artworkFilename)

    const replacements = {
        date: safeValue(data.date),
        brandName: safeValue(data.brandName),
        composition: safeValue(data.composition),
        packSize: safeValue(data.packSize),
        qty: safeValue(data.qty),
        rate: safeValue(data.rate),
        amount: safeValue(data.amount),
        mrp: safeValue(data.mrp),
        clientName: safeValue(data.clientName),
        section: safeValue(data.section),
        productStatus: safeValue(data.productStatus),
        designer: safeValue(data.designer),
        concernedPerson: safeValue(data.concernedPerson),
        innerPacking: safeValue(data.innerPacking),
        outerPacking: safeValue(data.outerPacking),
        foilTube: safeValue(data.foilTube),
        additional: safeValue(data.additional),
        approvedArtwork: safeValue(data.approvedArtwork),
        reasonIfHold: safeValue(data.reasonIfHold),
        poNumber: safeValue(data.poNumber),
        poDate: safeValue(data.poDate),
        innerOrder: safeValue(data.innerOrder),
        outerOrder: safeValue(data.outerOrder),
        foilTubeOrder: safeValue(data.foilTubeOrder),
        additionalOrder: safeValue(data.additionalOrder),
        receiptDate: safeValue(data.receiptDate),
        shortExcess: safeValue(data.shortExcess),
        dispatchDate: safeValue(data.dispatchDate),
        shipper: safeValue(data.shipper),
        stage: safeValue(data.stage),
        attachApprovedArtwork: safeValue(artworkFilename)
    };

    try {
        const isUpdate = !!data.id;
        //   console.log("Form Data:", formFields);
        //   console.log("Uploaded File:", artworkFile);

        if (isUpdate) {
            // Update existing record
            replacements.id = data.id;
            await db.query(
                `UPDATE orders SET 
            date=:date, brandName=:brandName, composition=:composition, packSize=:packSize,
            qty=:qty, rate=:rate, amount=:amount, mrp=:mrp, clientName=:clientName,
            section=:section, productStatus=:productStatus, designer=:designer, concernedPerson=:concernedPerson,
            innerPacking=:innerPacking, outerPacking=:outerPacking, foilTube=:foilTube, additional=:additional,
            approvedArtwork=:approvedArtwork, reasonIfHold=:reasonIfHold, poNumber=:poNumber, poDate=:poDate,
            innerOrder=:innerOrder, outerOrder=:outerOrder, foilTubeOrder=:foilTubeOrder, additionalOrder=:additionalOrder,
            receiptDate=:receiptDate, shortExcess=:shortExcess, dispatchDate=:dispatchDate, shipper=:shipper, stage=:stage,
            attachApprovedArtwork=:attachApprovedArtwork
          WHERE id=:id`, { replacements }
            );
            res.json({ message: 'Progress updated', id: data.id });
        } else {
            // Insert new record
            const [result] = await db.query(
                `INSERT INTO orders (
            date, brandName, composition, packSize, qty, rate, amount, mrp,
            clientName, section, productStatus, designer, concernedPerson,
            innerPacking, outerPacking, foilTube, additional,
            approvedArtwork, reasonIfHold, poNumber, poDate,
            innerOrder, outerOrder, foilTubeOrder, additionalOrder,
            receiptDate, shortExcess, dispatchDate, shipper, stage, attachApprovedArtwork
          ) VALUES (
            :date, :brandName, :composition, :packSize, :qty, :rate, :amount, :mrp,
            :clientName, :section, :productStatus, :designer, :concernedPerson,
            :innerPacking, :outerPacking, :foilTube, :additional,
            :approvedArtwork, :reasonIfHold, :poNumber, :poDate,
            :innerOrder, :outerOrder, :foilTubeOrder, :additionalOrder,
            :receiptDate, :shortExcess, :dispatchDate, :shipper, :stage, :attachApprovedArtwork
          )`, { replacements }
            );

            // Use Sequelize's metadata if available
            const insertedId = result && result > 0 ? result : null;

            res.json({ message: 'Progress saved', id: insertedId });
        }
    } catch (err) {
        console.error('Error saving progress:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get distinct brand names
router.get('/brands', async(req, res) => {
    try {
        const [brands] = await db.query(
            "SELECT DISTINCT brandName FROM orders WHERE brandName IS NOT NULL AND brandName != ''"
        );
        res.json(brands);
    } catch (err) {
        console.error('Error fetching brand names:', err);
        res.status(500).json({ error: 'Failed to fetch brand names' });
    }
});

// Get brand details
router.post('/getBrandDetails', async(req, res) => {
    const { brandName } = req.body;

    if (!brandName) {
        return res.status(400).json({ message: 'brandName is required' });
    }

    try {
        const [result] = await db.query(
            "SELECT * FROM orders WHERE brandName = :brandName LIMIT 1", {
                replacements: { brandName },
                type: QueryTypes.SELECT
            }
        );

        if (!result) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        res.json({ data: result });
    } catch (error) {
        console.error('Error fetching brand details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/by-concerned/:empId', async (req, res) => {
    const { empId } = req.params;
    console.log("empId:", empId);
  
    try {
      const sql = `
        SELECT o.*
        FROM orders o
        JOIN SignUps s ON o.concernedPerson = s.emp_id
        ORDER BY o.id DESC
      `;
  
      const [results] = await db.query(sql, {
        replacements: [empId],
      });
  
      res.json(results);
    } catch (err) {
      console.error("Error fetching orders for concerned person:", err);
      res.status(500).json({ message: "Failed to fetch concerned orders" });
    }
  });
  
  
router.post("/edit-status", async (req, res) => {
  const { orderId, status } = req.body;
  console.log("Editing order", orderId, "at stage", status);

  try {
    // Fetch order by primary key (id)
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Optionally update the productStatus or other status field:
    // order.productStatus = status;
    // await order.save();

    // Send back the full order data
    res.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;