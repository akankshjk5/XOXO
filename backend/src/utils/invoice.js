const fs = require("fs");
const path = require("path");
const logger = require("../config/logger");

const INVOICE_DIR = path.join(__dirname, "..", "..", "invoices");

function ensureDir() {
  if (!fs.existsSync(INVOICE_DIR)) fs.mkdirSync(INVOICE_DIR, { recursive: true });
}

/**
 * Generates a simple HTML invoice and returns its public path.
 */
function generateInvoice({ booking, user, packageTitle }) {
  ensureDir();
  const filename = `invoice-${booking.bookingRef}.html`;
  const filepath = path.join(INVOICE_DIR, filename);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${booking.bookingRef}</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:24px}
h1{color:#0D3D2E}table{width:100%;border-collapse:collapse;margin:24px 0}
td,th{padding:10px;border-bottom:1px solid #eee;text-align:left}th{color:#666;font-weight:500}
.total{font-size:18px;font-weight:700}</style></head>
<body>
<h1>XOXO Travels</h1>
<p>Tax Invoice / Receipt</p>
<p><strong>Invoice #:</strong> ${booking.bookingRef}<br>
<strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}<br>
<strong>Customer:</strong> ${user.name} (${user.email})</p>
<table>
<tr><th>Description</th><th>Qty</th><th>Amount (INR)</th></tr>
<tr><td>${packageTitle || "Holiday package"}</td><td>${booking.numTravelers}</td><td>₹${booking.totalAmount?.toLocaleString("en-IN")}</td></tr>
<tr><td colspan="2" class="total">Total paid</td><td class="total">₹${booking.paidAmount?.toLocaleString("en-IN")}</td></tr>
</table>
<p style="color:#666;font-size:13px">Payment ID: ${booking.razorpayPaymentId || "N/A"}<br>
This is a computer-generated invoice.</p>
</body></html>`;

  fs.writeFileSync(filepath, html, "utf8");
  logger.info("Invoice generated", { bookingRef: booking.bookingRef, filename });

  return {
    filename,
    path: filepath,
    url: `/invoices/${filename}`,
  };
}

module.exports = { generateInvoice, INVOICE_DIR };
