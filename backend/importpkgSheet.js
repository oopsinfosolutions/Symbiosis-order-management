const XLSX = require("xlsx");
const path = require("path");
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
    const poDate = poDateRaw ? new Date(poDateRaw) : null;

    if (!productName) {
      console.warn(`⏭️ Skipped Row ${rowIndex}: Missing required fields`, {
        productName,
        person,
        poDate: poDateRaw,
      });
      skipped++;
    } else {
      await Order.create({
        poNumber: cleanRow["PO.NO."],
        date: poDate,
        brandName: productName,
        clientName: person,
        section: cleanRow["SECTION"],
        productStatus: cleanRow["NEW/REP"] || "repeat",
        packSize: cleanRow["PACK SIZE"],
        type: cleanRow["TYPE"],
        qty: parseFloat(cleanRow["QTY"]) || 0,
        rate: parseFloat(cleanRow["RATE"]) || 0,
        innerPrinter: cleanRow["PRINTER"],
        receiptDate: cleanRow["RCVD DATE"] ? new Date(cleanRow["RCVD DATE"]) : null,
      });

      console.log(`✅ Imported Row ${rowIndex}: ${productName}`);
      inserted++;
    }
  } catch (err) {
    console.error(`❌ Row ${rowIndex} error:`, err.message);
    failed++;
  }

  rowIndex++; // ✅ Always increment!
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
