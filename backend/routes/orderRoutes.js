const express = require("express");
const router = express.Router();
const db = require('../config/db'); // Sequelize connection
const { QueryTypes } = require('sequelize');
const multer = require('multer');

const safeValue = (v) => (v !== undefined && v !== '' ? v : null);

const storage = multer.memoryStorage(); // Or use diskStorage if saving files to disk
const upload = multer({ storage });

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


router.get("/concerned-persons", async(req, res) => {
    try {
        const persons = await Order.findAll();
        res.json(persons);
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
        res.status(500).json({ error: "Failed to fetch concerned persons." });
    }
});

// Save Progress (Insert or Update)
router.post('/saveProgress', upload.single('artwork'), async(req, res) => {
    const data = req.body;
    console.log(data)

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
            receiptDate=:receiptDate, shortExcess=:shortExcess, dispatchDate=:dispatchDate, shipper=:shipper
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
            receiptDate, shortExcess, dispatchDate, shipper
          ) VALUES (
            :date, :brandName, :composition, :packSize, :qty, :rate, :amount, :mrp,
            :clientName, :section, :productStatus, :designer, :concernedPerson,
            :innerPacking, :outerPacking, :foilTube, :additional,
            :approvedArtwork, :reasonIfHold, :poNumber, :poDate,
            :innerOrder, :outerOrder, :foilTubeOrder, :additionalOrder,
            :receiptDate, :shortExcess, :dispatchDate, :shipper
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

router.get('/orders/by-concerned/:empId', async(req, res) => {
    const { empId } = req.params;

    try {
        const sql = `

      SELECT o.*
      FROM orders o
      JOIN SignUps s ON o.concernedPerson = s.fullName

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


module.exports = router;