const XLSX = require("xlsx");
const path = require("path");
const Order = require("./models/Order");
const sequelize = require("./config/db");

const file = path.join(__dirname, "PKG SHEET NEW.xlsx");

async function importPkgSheet() {
    try {
        const workbook = XLSX.readFile(file);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

        let rowIndex = 1;

const requiredFields = ["PO DATE", "PRODUCTS", "PERSON"];

for (const row of rows) {
  const cleanRow = {};
  for (let key in row) {
    cleanRow[key.trim()] = row[key];
  }

  const productName = cleanRow["PRODUCTS"]?.toString().trim();
  const person = cleanRow["PERSON"]?.toString().trim();
  const poDate = cleanRow["PO DATE"] ? new Date(cleanRow["PO DATE"]) : null;

  // Skip if required fields are missing
  if (!productName || !person || !poDate) {
    console.warn(
      `⏭️ Skipped Row ${rowIndex} - Missing required fields (productName: ${productName}, person: ${person}, poDate: ${poDate})`
    );
    rowIndex++;
    continue;
  }

  try {
    await Order.create({
      poNumber: cleanRow["PO.NO."],
      date: poDate,
      brandName: productName,
      clientName: person,
      section: cleanRow["TYPE"],
      productStatus: cleanRow["N.REPEAT"] || "repeat",
      packSize: cleanRow["PACK SIZE"],
      type: cleanRow["TYPE_1"],
      qty: parseFloat(cleanRow["QTY"]) || 0,
      rate: parseFloat(cleanRow["RATE"]) || 0,
      innerPrinter: cleanRow["PRINTERS"],
      receiptDate: cleanRow["RCVD DATE "] ? new Date(cleanRow["RCVD DATE "]) : null,
    });

    console.log(`✅ Imported Row ${rowIndex}: ${productName}`);
  } catch (err) {
    console.error(`❌ Row ${rowIndex} error:`, err.errors?.map(e => e.message).join(", "));
  }

  rowIndex++;
}


console.log("🎉 All rows processed.");



        console.log("✅ Finished importing PKG SHEET.");
        process.exit();
    } catch (err) {
        console.error("❌ Fatal error:", err.message);
        process.exit(1);
    }
}

importPkgSheet();
