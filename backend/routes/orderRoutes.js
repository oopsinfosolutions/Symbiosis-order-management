const express = require("express");
const router = express.Router();
const db = require('../config/db'); // Sequelize connection
const sequelize = db;
const multer = require("multer");
const path = require("path");
const { QueryTypes } = require('sequelize');
const { Op } = require("sequelize");
// const getStatus = require("../utils/getStatus"); // If used for dueToday/overdue

const safeValue = (v) => (v !== undefined && v !== '' ? v : null);

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
};

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

router.get("/orders", async (req, res) => {
  try {
    const {
      empId,
      searchTerm = "",
      navStatus,
      stageFilter,
      statusFilter,
      category,
      selectedPrinter,
      selectedSections,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};
    const currentPage = parseInt(page);
    const pageSize = parseInt(limit);
    const offset = (currentPage - 1) * pageSize;

    // 🔍 Search term filter (brandName, status, etc.)
    if (searchTerm) {
      const term = `%${searchTerm.toLowerCase()}%`;
      where[Op.or] = [
        sequelize.where(sequelize.fn("LOWER", sequelize.col("brandName")), { [Op.like]: term }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("productStatus")), { [Op.like]: term }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("qty")), { [Op.like]: term }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("rate")), { [Op.like]: term }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("amount")), { [Op.like]: term }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("date")), { [Op.like]: term }),
      ];
    }

    // 🧭 Product Status (Repeat/New)
    if (navStatus) {
      where.productStatus = navStatus;
    }

    // 📦 Stage Filter
    if (stageFilter) {
      const stages = stageFilter
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (stages.length > 0) {
        where.stage = stages.length === 1 ? stages[0] : { [Op.in]: stages };
      }
    }

    // 👨‍💼 Concerned Person (apply unless empId = amin + category = printers/sections)
    const isAmin = empId === "admin";
    const showAll = isAmin || (category === "view-all-orders" || category === "printers" || category === "sections");

    if (!showAll && empId) {
      where.concernedPerson = empId;
    }

    // 🖨️ Printer Filter (inside WHERE)
    if (category === "printers" && selectedPrinter) {
      where[Op.or] = [
        { innerPrinter: selectedPrinter },
        { outerPrinter: selectedPrinter },
        { foilTubePrinter: selectedPrinter },
        { additionalPrinter: selectedPrinter }
      ];
    }

    // 🗂️ Section Filter (inside WHERE)
    if (category === "sections" && selectedSections) {
      where.section = selectedSections;
    }

    // ✅ Total count with DB filters applied
    const totalCount = await Order.count({ where });

    // ✅ Fetch paginated orders
    let orders = await Order.findAll({
      where,
      limit: pageSize,
      offset,
      order: [['id', 'DESC']],
    });

    // ⏰ Overdue / Due Today filter (after fetching)
    if (statusFilter) {
      const getStatus = require("../utils/getStatus");
      orders = orders.filter(order => {
        const status = getStatus(order.date, order.productStatus, order.stage, order.poDate).label.toLowerCase();
        if (statusFilter === "dueToday") return status === "due today";
        if (statusFilter === "overdue") return status === "overdue";
        return true;
      });
    }

    res.json({
      orders,
      currentPage,
      totalPages: Math.ceil(totalCount / pageSize)
    });
  } catch (error) {
    console.error("❌ Error fetching filtered orders:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Route: /api/concerned-persons
router.get("/concerned-persons", async (req, res) => {
    try {
        const [results] = await db.query(
            "SELECT emp_id, fullName FROM signups WHERE type='employee'"
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
    console.log(data.date);

    const artworkFilename = req.file?.filename || null;
    console.log(artworkFilename);

    const now = new Date();

    const replacements = {
        date: formatDate(data.date),
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
        poDate: formatDate(data.poDate),
        innerOrder: safeValue(data.innerOrder),
        outerOrder: safeValue(data.outerOrder),
        foilTubeOrder: safeValue(data.foilTubeOrder),
        additionalOrder: safeValue(data.additionalOrder),
        receiptDate: formatDate(data.receiptDate),
        shortExcess: safeValue(data.shortExcess),
        dispatchDate: formatDate(data.dispatchDate),
        dispatchQty: safeValue(data.dispatchQty), // Added missing field
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
        createdAt: formatDate(now),
        updatedAt: formatDate(now)
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
                    receiptDate=:receiptDate, shortExcess=:shortExcess, dispatchDate=:dispatchDate, dispatchQty=:dispatchQty, shipper=:shipper, stage=:stage,
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
                    receiptDate, shortExcess, dispatchDate, dispatchQty, shipper, stage, 
                    attachApprovedArtwork, innerPrinter, outerPrinter, 
                    foilTubePrinter, additionalPrinter, innersize, outersize,
                    foiltubesize, additionalsize, createdAt, updatedAt
                ) VALUES (
                    :date, :brandName, :composition, :packSize, :qty, :rate, :amount, :mrp,
                    :clientName, :section, :productStatus, :designer, :concernedPerson,
                    :innerPacking, :OuterPacking, :foilTube, :additional,
                    :approvedArtwork, :reasonIfHold, :poNumber, :poDate,
                    :innerOrder, :outerOrder, :foilTubeOrder, :additionalOrder,
                    :receiptDate, :shortExcess, :dispatchDate, :dispatchQty, :shipper, :stage, 
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
router.get("/orders/by-concerned/:empId", async (req, res) => {
  const empId = req.params.empId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    // Total count
    const [countResult] = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE concernedPerson = ?",
      {
        replacements: [empId],
      }
    );

    const count = countResult?.count || 0;

    // Paged orders
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE concernedPerson = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      {
        replacements: [empId, limit, offset],
      }
    );

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(count / limit)),
    });
  } catch (err) {
    console.error("Error fetching concerned orders:", err);
    res.status(500).json({ error: "Internal server error" });
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

router.get('/designer-orders', async (req, res) => {
  const { fullname, designer } = req.query;

  // Case: filter by designer (for /DesignerPage/all)
  if (designer) {
    try {
      const orders = await Order.findAll({
        where: {
          designer: designer,
          stage: 1, // or 2, depending on your flow
        },
        order: [['id', 'DESC']],
      });
      return res.json({ orders });
    } catch (error) {
      console.error("Error fetching orders by designer:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Case: logged-in user's fullname
  if (fullname) {
    try {
      const orders = await Order.findAll({
        where: {
          designer: fullname,
          stage: 1,
        },
        order: [['id', 'DESC']],
      });
      return res.json({ orders });
    } catch (error) {
      console.error("Error fetching designer orders:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(400).json({ error: "Missing fullname or designer" });
});

router.post('/export-orders', async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || orders.length === 0) {
      return res.status(400).json({ message: 'No orders provided' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');


    const firstOrder = orders[0];
    worksheet.columns = Object.keys(firstOrder).map((key) => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      key,
      width: 20,
    }));

    // Add each order as a row
    orders.forEach(order => {
      worksheet.addRow(order);
    });

    // Set response headers to return Excel file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ message: 'Failed to export Excel' });
  }
});


router.post("/orders/edit-artwork", async (req, res) => {
  const { orderId, status, stage } = req.body;
  try {
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.productStatus = status;
    if (stage !== undefined) order.stage = stage;
    await order.save();

    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update", error });
  }
});

// In routes/orders.js or similar
router.put("/update-stage", async (req, res) => {
  const { orderId, newStage } = req.body;

  try {
    const [updatedRowsCount] = await Order.update(
      { stage: newStage },
      { where: { id: orderId } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Fetch the updated order
    const updatedOrder = await Order.findByPk(orderId);

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating stage:", error);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;