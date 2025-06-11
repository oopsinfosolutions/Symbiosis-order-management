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

// Save Progress (Insert or Update) - FIXED VERSION
router.post('/saveProgress', upload.single("artwork"), async(req, res) => {
    const data = req.body;
    console.log(data);

    const artworkFilename = req.file?.filename || null;
    console.log(artworkFilename);

    const now = new Date();

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
        OuterPacking: safeValue(data.OuterPacking),
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
        qtyDispatch: safeValue(data.qtyDispatch), // Added missing field
        shipper: safeValue(data.shipper),
        stage: safeValue(data.stage),
        attachApprovedArtwork: safeValue(artworkFilename),
        innerPrinter: safeValue(data.innerPrinter),
        outerPrinter: safeValue(data.outerPrinter),
        foilTubePrinter: safeValue(data.foilTubePrinter),
        additionalPrinter: safeValue(data.additionalPrinter),
        innersize: safeValue(data.innersize),
        outersize: safeValue(data.outersize),
        foiltubesize: safeValue(data.foiltubesize),
        additionalsize: safeValue(data.additionalsize),
        createdAt: now,
        updatedAt: now
    };

    try {
        const isUpdate = !!data.id;

        if (isUpdate) {
            // Update existing record
            replacements.id = data.id;
            await db.query(
                `UPDATE orders SET 
                    date=:date, brandName=:brandName, composition=:composition, packSize=:packSize,
                    qty=:qty, rate=:rate, amount=:amount, mrp=:mrp, clientName=:clientName,
                    section=:section, productStatus=:productStatus, designer=:designer, concernedPerson=:concernedPerson,
                    innerPacking=:innerPacking, OuterPacking=:OuterPacking, foilTube=:foilTube, additional=:additional,
                    approvedArtwork=:approvedArtwork, reasonIfHold=:reasonIfHold, poNumber=:poNumber, poDate=:poDate,
                    innerOrder=:innerOrder, outerOrder=:outerOrder, foilTubeOrder=:foilTubeOrder, additionalOrder=:additionalOrder,
                    receiptDate=:receiptDate, shortExcess=:shortExcess, dispatchDate=:dispatchDate, qtyDispatch=:qtyDispatch, shipper=:shipper, stage=:stage,
                    attachApprovedArtwork=:attachApprovedArtwork, innerPrinter=:innerPrinter, outerPrinter=:outerPrinter, 
                    foilTubePrinter=:foilTubePrinter, additionalPrinter=:additionalPrinter, innersize=:innersize, outersize=:outersize,
                    foiltubesize=:foiltubesize, additionalsize=:additionalsize, updatedAt=:updatedAt
                WHERE id=:id`, 
                { replacements }
            );
            res.json({ message: 'Progress updated', id: data.id });
        } else {
            // Insert new record - FIXED: Added missing columns and values
            const [result] = await db.query(
                `INSERT INTO orders (
                    date, brandName, composition, packSize, qty, rate, amount, mrp,
                    clientName, section, productStatus, designer, concernedPerson,
                    innerPacking, OuterPacking, foilTube, additional,
                    approvedArtwork, reasonIfHold, poNumber, poDate,
                    innerOrder, outerOrder, foilTubeOrder, additionalOrder,
                    receiptDate, shortExcess, dispatchDate, qtyDispatch, shipper, stage, 
                    attachApprovedArtwork, innerPrinter, outerPrinter, 
                    foilTubePrinter, additionalPrinter, innersize, outersize,
                    foiltubesize, additionalsize, createdAt, updatedAt
                ) VALUES (
                    :date, :brandName, :composition, :packSize, :qty, :rate, :amount, :mrp,
                    :clientName, :section, :productStatus, :designer, :concernedPerson,
                    :innerPacking, :OuterPacking, :foilTube, :additional,
                    :approvedArtwork, :reasonIfHold, :poNumber, :poDate,
                    :innerOrder, :outerOrder, :foilTubeOrder, :additionalOrder,
                    :receiptDate, :shortExcess, :dispatchDate, :qtyDispatch, :shipper, :stage, 
                    :attachApprovedArtwork, :innerPrinter, :outerPrinter, 
                    :foilTubePrinter, :additionalPrinter, :innersize, :outersize,
                    :foiltubesize, :additionalsize, :createdAt, :updatedAt
                )`, 
                { replacements }
            );

            // Get the inserted ID
            const insertedId = result && result > 0 ? result : null;
            res.json({ message: 'Progress saved', id: insertedId });
        }
    } catch (err) {
        console.error('Error saving progress:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// Get distinct brand names
router.get('/brands', async(req, res) => {
    try {
        const results = await db.query(
            "SELECT DISTINCT brandName FROM orders WHERE brandName IS NOT NULL AND brandName != ''",
            { type: QueryTypes.SELECT }
        );
        
        // Ensure we return the correct format
        const brands = results.map(row => ({
            brandName: row.brandName
        }));
        
        console.log('Brands fetched:', brands); // Debug log
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

// Get orders by concerned person
router.get('/by-concerned/:empId', async (req, res) => {
    const { empId } = req.params;
    console.log("empId:", empId);
  
    try {
        const sql = `
            SELECT * FROM orders
            WHERE concernedPerson = :empId
            ORDER BY id DESC
        `;

        const [results] = await db.query(sql, {
            replacements: { empId },
        });
  
        res.json(results);
    } catch (err) {
        console.error("Error fetching orders for concerned person:", err);
        res.status(500).json({ message: "Failed to fetch concerned orders" });
    }
});

// Edit order status
router.post("/edit-status", async (req, res) => {
    const { orderId, status } = req.body;
    console.log("Editing order", orderId, "at stage", status);

    try {
        // Fetch order by primary key (id)
        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update the status if needed
        // order.productStatus = status;
        // await order.save();

        // Send back the full order data
        res.json({ order });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Designer dashboard
router.get('/designer', (req, res) => {
    res.json({ message: "Designer dashboard" });
});

router.get('/designer-orders/:designerName', async (req, res) => {
  try {
    const designerName = req.params.designerName;
    const orders = await Order.findAll({
      where: {
        productStatus: 'NEW',
        designer: designerName
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching designer orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

module.exports = router;