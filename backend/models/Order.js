const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  // Stage 1: Order Opening
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  brandName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  composition: DataTypes.STRING,
  packSize: DataTypes.STRING,
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
  },
  mrp: DataTypes.FLOAT,
  clientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: DataTypes.STRING,
  productStatus: {
    type: DataTypes.ENUM('NEW', 'REPEAT'),
    defaultValue: 'NEW',
  },
  designer: DataTypes.STRING,
  stage: DataTypes.NUMBER,

  // Stage 2: Packing Material Status
  concernedPerson: DataTypes.STRING,
  innerPacking: DataTypes.STRING,
  outerPacking: DataTypes.STRING,
  foilTube: DataTypes.STRING,
  additional: DataTypes.STRING,

  // Stage 3: Artwork Status
  approvedArtwork: DataTypes.STRING,
  reasonIfHold: DataTypes.STRING,
  attachApprovedArtwork: DataTypes.STRING,

  // Stage 4: Order Form
  poNumber: DataTypes.STRING,
  poDate: DataTypes.DATE,
  innerOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  outerOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  foilTubeOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  additionalOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  // Stage 5: Receipt Details
  receiptDate: DataTypes.DATE,
  shortExcess: {
    type: DataTypes.ENUM('Short', 'Excess', 'OK'),
    defaultValue: 'OK',
  },

  // Stage 6: Finished Product Dispatch
  dispatchDate: DataTypes.DATE,
  dispatchQty: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shipper: DataTypes.INTEGER,
}, {
  timestamps: true, // enables createdAt and updatedAt
});

module.exports = Order;
