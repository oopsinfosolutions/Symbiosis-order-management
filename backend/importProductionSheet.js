const XLSX = require("xlsx");
const path = require("path");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const Order = require("./models/Order");
const sequelize = require("./config/db");

const file = path.join(__dirname, "newProduction1.xlsx");

// Helper function to parse different date formats
function parseExcelDate(raw) {
  if (!raw) return null;

  if (typeof raw === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + raw * 86400000);
  }

  if (raw instanceof Date && !isNaN(raw)) return raw;

  if (typeof raw === "string") {
    const parts = raw.split(".");
    if (parts.length === 3) {
      const [d, m, y] = parts.map(p => p.padStart(2, "0"));
      const formatted = `${d}.${m}.${y}`;
      const parsed = dayjs(formatted, "DD.MM.YY", true);
      return parsed.isValid() ? parsed.toDate() : null;
    }
  }

  return null;
}

async function importProductionSheet() {
  try {
    const workbook = XLSX.readFile(file);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    let insertedRows = [];
    let skippedRows = [];
    let failedRows = [];
    let rowIndex = 1;

    for (const row of rows) {
      const product = row["PRODUCTS NAMES"];
      const rawDate = row["DATE"];
      const parsedDate = parseExcelDate(rawDate);

      if (!product || !parsedDate) {
        console.warn(`⏭️ Skipped Row ${rowIndex}: Missing required fields`, {
          productName: product,
          date: rawDate,
        });
        skippedRows.push({ rowIndex, reason: "Missing product or invalid date", product, date: rawDate });
        rowIndex++;
        continue;
      }

      try {
        await Order.create({
          date: parsedDate,
          brandName: product,
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

        console.log(`✅ Inserted Row ${rowIndex}: ${product}`);
        insertedRows.push({ rowIndex, product });
      } catch (err) {
        console.error(`❌ Failed Row ${rowIndex}:`, err.message);
        failedRows.push({ rowIndex, product, error: err.message });
      }

      rowIndex++;
    }

    // Summary
    console.log("\n📊 IMPORT SUMMARY");
    console.log(`✔️ Inserted: ${insertedRows.length}`);
    console.log(`⏭️ Skipped: ${skippedRows.length}`);
    console.log(`❌ Failed: ${failedRows.length}`);

    if (skippedRows.length) {
      console.log("\n⏭️ Skipped Rows:");
      skippedRows.forEach(row => console.log(`- Row ${row.rowIndex}: ${row.reason}`));
    }

    if (failedRows.length) {
      console.log("\n❌ Failed Rows:");
      failedRows.forEach(row => console.log(`- Row ${row.rowIndex}: ${row.product} | Error: ${row.error}`));
    }

    console.log("\n✅ Finished importing PRODUCTION PLANNING SHEET.");
    process.exit();
  } catch (err) {
    console.error("🔥 Fatal error:", err.message);
    process.exit(1);
  }
}

importProductionSheet();
