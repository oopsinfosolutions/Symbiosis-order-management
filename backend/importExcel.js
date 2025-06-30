const XLSX = require("xlsx");
const path = require("path");
const Order = require("./models/Order"); // Your Sequelize model
const sequelize = require("./config/db"); // Sequelize config

const files = [
  path.join(__dirname, "Third Party PO (4).xlsx"),
  // path.join(__dirname, "NEW PKG.xlsx")
];

async function importExcelData() {
  try {
    let combinedRows = [];

    // Read both Excel files
    for (const file of files) {
      const workbook = XLSX.readFile(file);
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null }); // keep empty cells as null
      combinedRows.push(...rows);
    }

    let rowIndex = 1;

    for (const row of combinedRows) {
      if (!row["PRODUCT NAME"] || !row["PARTY NAMES"]) {
        console.warn(`⏭️ Skipped Row ${rowIndex} - Missing brand/client name`);
        rowIndex++;
        continue;
      }

      try {
        await Order.create({
          date: row["DATE"] ? new Date(row["DATE"]) : null,
          brandName: row["PRODUCT NAME"],
          composition: row["COMPOSITION"],
          packSize: row["PACK SIZE"],
          qty: row["QTY"] || 0,
          rate: row["RATE"] || 0,
          amount: row["AMOUNTS"] || 0,
          mrp: row["MRP"] || null,
          clientName: row["PARTY NAMES"],
          section: row["TYPE"],
          productStatus: row["PM"] || "repeat",
          designer: row["Designer"],
          concernedPerson: row["PERSON"],
          innerPacking: row["Inner Packing"],
          OuterPacking: row["Outer Packing"],
          foilTube: row["Foil/Tube"],
          additional: row["Additional"],
        //  import till here only
          approvedArtwork: row["Approved Artwork"],
          reasonIfHold: row["Reason If Hold"],
          poNumber: row["PO Number"],
          poDate: row["PO Date"] ? new Date(row["PO Date"]) : null,
          innerOrder: row["Inner Order"] || 0,
          outerOrder: row["Outer Order"] || 0,
          foilTubeOrder: row["Foil/Tube Order"] || 0,
          additionalOrder: row["Additional Order"] || 0,
          receiptDate: row["Receipt Date"] ? new Date(row["Receipt Date"]) : null,
          shortExcess: row["Short/Excess"] || "OK",
          dispatchDate: row["Dispatch Date"] ? new Date(row["Dispatch Date"]) : null,
          dispatchQty: row["Qty Dispatch"] || 0,
          shipper: row["Shipper"] || null
        });

        console.log(`✅ Imported Row ${rowIndex}: Brand - ${row["Brand Name"]}, Client - ${row["Client Name"]}`);
      } catch (err) {
        console.error(`❌ Error at Row ${rowIndex}:`, err.message);
      }

      rowIndex++;
    }

    console.log("🎉 All rows processed.");
    process.exit();
  } catch (error) {
    console.error("❌ Fatal import error:", error);
    process.exit(1);
  }
}

importExcelData();
