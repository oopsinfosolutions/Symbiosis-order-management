const XLSX = require("xlsx");
const path = require("path");
const Order = require("./models/Order");
const sequelize = require("./config/db");

const file = path.join(__dirname, "PRODUCTION PLANING SHEET.xlsx");

async function importProductionSheet() {
  try {
    const workbook = XLSX.readFile(file);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    let rowIndex = 1;

    for (const row of rows) {
      if (!row["PRODUCTS NAMES"] || !row["PARTY NAME"]) {
        console.warn(`⏭️ Skipped row ${rowIndex} (missing product or party)`);
        rowIndex++;
        continue;
      }

      try {
        await Order.create({
          date: row["DATE"] ? new Date(row["DATE"]) : null,
          brandName: row["PRODUCTS NAMES"],
          composition: row["COMPOSITION"],
          packSize: row["PACKING"],
          qty: row["QUANTITY"] || 0,
          rate: row["RATE"] || 0,
          amount: row["AMOUNTS"] || 0,
          mrp: row["MRP"],
          clientName: row["PARTY NAME"],
          concernedPerson: row["PERSON"],
          section: row["TYPE"],
          productStatus: row["PM"] || "repeat",
          innerPacking: row["INNER/ OUTER"],
          foilTube: row["FOIL/ST/TUBE"]
        });

        console.log(`✅ Imported row ${rowIndex}: ${row["PRODUCTS NAMES"]}`);
      } catch (err) {
        console.error(`❌ Row ${rowIndex} error:`, err.message);
      }

      rowIndex++;
    }

    console.log("✅ Finished importing PRODUCTION PLANING SHEET.");
    process.exit();
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    process.exit(1);
  }
}

importProductionSheet();
