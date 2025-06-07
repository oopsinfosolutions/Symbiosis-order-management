"# Symbiosis-order-management" 

source code on git : https://github.com/oopsinfosolutions/Symbiosis-order-management

#Create db:
CREATE DATABASE order_process;
USE order_process;

#create orders table query on mysql: 
CREATE TABLE orders (
  id INT(11) NOT NULL AUTO_INCREMENT,
  date DATETIME DEFAULT NULL,
  brandName VARCHAR(255) DEFAULT NULL,
  composition VARCHAR(255) DEFAULT NULL,
  packSize VARCHAR(255) DEFAULT NULL,
  qty INT(11) DEFAULT NULL,
  rate FLOAT DEFAULT NULL,
  amount FLOAT DEFAULT NULL,
  mrp FLOAT DEFAULT NULL,
  clientName VARCHAR(255) DEFAULT NULL,
  section VARCHAR(255) DEFAULT NULL,
  productStatus VARCHAR(255) DEFAULT NULL,
  stage INT(11) DEFAULT 1,
  designer VARCHAR(255) DEFAULT NULL,
  concernedPerson VARCHAR(255) DEFAULT NULL,
  innerPacking VARCHAR(255) DEFAULT NULL,
  OuterPacking VARCHAR(255) DEFAULT NULL,
  foilTube VARCHAR(255) DEFAULT NULL,
  additional VARCHAR(255) DEFAULT NULL,
  approvedArtwork VARCHAR(255) DEFAULT NULL,
  reasonIfHold VARCHAR(255) DEFAULT NULL,
  attachApprovedArtwork VARCHAR(255) DEFAULT NULL,
  poNumber VARCHAR(255) DEFAULT NULL,
  poDate DATETIME DEFAULT NULL,
  innerOrder INT(11) DEFAULT NULL,
  outerOrder INT(11) DEFAULT NULL,
  foilTubeOrder INT(11) DEFAULT NULL,
  additionalOrder INT(11) DEFAULT NULL,
  receiptDate DATETIME DEFAULT NULL,
  shortExcess VARCHAR(255) DEFAULT NULL,
  dispatchDate DATETIME DEFAULT NULL,
  dispatchQty INT(11) DEFAULT NULL,
  shipper INT(11) DEFAULT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id)
);

#create signups table query:
CREATE TABLE signups (
  id INT(11) NOT NULL AUTO_INCREMENT,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  Emp_id VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  type ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

path and command for backend:
Symbiosis Management system\backend> node .\server.js

for frontend:
Symbiosis Management system\frontend> npm start