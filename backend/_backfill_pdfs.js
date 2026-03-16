// One-time script: set pdfUrl + generate & upload PDFs for tickets missing pdfUrl
// Usage: node _backfill_pdfs.js
// Delete this file after running it.
require('dotenv').config();
const { Tickets } = require('./models/db');
const generateTicketPDF = require('./utils/generateTicketPDF');
const { uploadTicketPDF, getExpectedPdfUrl } = require('./utils/supabase');

(async () => {
  const all = Tickets.findAll();
  const missing = all.filter(t => !t.pdfUrl);

  console.log(`Total tickets: ${all.length}, missing pdfUrl: ${missing.length}`);
  if (missing.length === 0) {
    console.log('Nothing to do.');
    process.exit(0);
  }

  let success = 0;
  let failed = 0;

  for (const ticket of missing) {
    const shortId = ticket.id.substring(0, 8).toUpperCase();
    const fileName = `ES_${shortId}.pdf`;
    const expectedUrl = getExpectedPdfUrl(fileName);

    if (!expectedUrl) {
      console.log(`[SKIP] ${shortId} — SUPABASE_URL not set`);
      failed++;
      continue;
    }

    // Set pdfUrl immediately (deterministic URL)
    Tickets.updateById(ticket.id, { pdfUrl: expectedUrl });

    try {
      const pdfBuffer = await generateTicketPDF(ticket, expectedUrl);
      const pdfUrl = await uploadTicketPDF(fileName, pdfBuffer);
      if (pdfUrl) {
        console.log(`[OK] ${shortId} -> ${pdfUrl}`);
        success++;
      } else {
        console.log(`[SKIP] ${shortId} — upload returned null`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] ${shortId}:`, err.message);
      failed++;
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  process.exit(0);
})();
