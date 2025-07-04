const XLSX = require("xlsx");
const path = require("path");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const Order = require("./models/Order"); // Sequelize model
const file = path.join(__dirname, "new.xlsx");

async function importPkgSheet() {
  try {
    const workbook = XLSX.readFile(file);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    console.log("🧾 Headers in Excel:", Object.keys(rows[0]));
    console.log("🔎 Sample row:", rows[0]);

    let inserted = 0;
    let skipped = 0;
    let failed = 0;
    let rowIndex = 1;

    console.log(`📊 Total rows in sheet: ${rows.length}`);

    for (const row of rows) {
      const cleanRow = {};
      for (let key in row) {
        cleanRow[key.trim()] = typeof row[key] === "string" ? row[key].trim() : row[key];
      }

      try {
        const productName = cleanRow["PRODUCTS NAMES"];
        let person = cleanRow["PEERSON"];
        if (!person) person = "SANDEEP";

        const poDateRaw = cleanRow["PO DATE"];
        let poDate = null;

        if (typeof poDateRaw === "number") {
          // Excel date number
          const excelEpoch = new Date(Date.UTC(1899, 11, 30));
          poDate = new Date(excelEpoch.getTime() + poDateRaw * 86400000);
        } else if (typeof poDateRaw === "string") {
          const parts = poDateRaw.split(".");
          if (parts.length === 3) {
            const [d, m, y] = parts.map(p => p.padStart(2, "0"));
            const formatted = `${d}.${m}.${y}`;
            const parsed = dayjs(formatted, "DD.MM.YY", true);
            if (parsed.isValid()) poDate = parsed.toDate();
          }
        } else if (poDateRaw instanceof Date && !isNaN(poDateRaw)) {
          poDate = poDateRaw;
        }

        if (!productName || !poDate) {
          console.warn(`⏭️ Skipped Row ${rowIndex}: Missing required fields`, {
            productName,
            person,
            poDate: poDateRaw,
          });
          skipped++;
        } else {
          await Order.create({
            date: poDate,
            poNumber: cleanRow["PO.NO."],
            brandName: productName,
            clientName: person,
            section: cleanRow["SECTION"],
            productStatus: cleanRow["NEW/REP"] || "repeat",
            packSize: cleanRow["PACK SIZE"],
            type: cleanRow["TYPE"],
            qty: parseFloat(cleanRow["QTY"]) || 0,
            rate: parseFloat(cleanRow["RATE"]) || 0,
            innerPrinter: cleanRow["PRINTER"],
            receiptDate: cleanRow["RCVD DATE"]
              ? new Date(cleanRow["RCVD DATE"])
              : null,
          });

          console.log(`✅ Imported Row ${rowIndex}: ${productName}`);
          inserted++;
        }
      } catch (err) {
        console.error(`❌ Row ${rowIndex} error:`, err.message);
        failed++;
      }

      rowIndex++;
    }

    // Summary
    console.log(`🎉 Import Complete`);
    console.log(`✔️ Inserted: ${inserted}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    process.exit(0);
  } catch (err) {
    console.error("🔥 Fatal error:", err.message);
    process.exit(1);
  }
}

importPkgSheet();
