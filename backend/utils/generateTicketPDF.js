// utils/generateTicketPDF.js — Server-side ticket PDF generator using pdfkit
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// EventSphere design tokens (RGB 0-255)
const GOLD = [201, 168, 76];
const DARK = [8, 8, 15];
const WHITE = [255, 255, 255];
const LIGHT_GRAY = [240, 236, 224];
const MID_GRAY = [144, 144, 168];

/**
 * Generate a ticket PDF and return it as a Buffer.
 * @param {object} ticket — ticket record from the database
 * @param {string} qrUrl — the URL to encode in the QR code (Supabase PDF URL)
 * @returns {Promise<Buffer>}
 */
async function generateTicketPDF(ticket, qrUrl) {
  // Generate QR code as PNG buffer
  const qrPngBuffer = await QRCode.toBuffer(qrUrl, {
    width: 400,
    margin: 1,
    color: { dark: '#08080f', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });

  return new Promise((resolve, reject) => {
    // A5 size: 420 x 595 points (148mm x 210mm)
    const doc = new PDFDocument({ size: [420, 595], margin: 0 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = 420;
    const margin = 40;
    const contentW = W - margin * 2;

    // --- Dark Header Background ---
    doc.rect(0, 0, W, 108).fill(rgbStr(DARK));

    // Gold accent line below header
    doc.rect(0, 108, W, 3.5).fill(rgbStr(GOLD));

    // Brand: "EventSphere"
    doc.font('Helvetica-Bold').fontSize(22).fillColor(rgbStr(GOLD));
    doc.text('EventSphere', 0, 36, { align: 'center', width: W });

    // Subtitle: "DIGITAL TICKET"
    doc.font('Helvetica').fontSize(10).fillColor(rgbStr(LIGHT_GRAY));
    doc.text('DIGITAL TICKET', 0, 62, { align: 'center', width: W });

    // Short ticket ID
    const shortId = ticket.id.substring(0, 8).toUpperCase();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(rgbStr(MID_GRAY));
    doc.text(shortId, 0, 82, { align: 'center', width: W });

    // --- Event Title ---
    let y = 128;
    doc.font('Helvetica-Bold').fontSize(18).fillColor(rgbStr(DARK));
    doc.text(ticket.eventTitle, margin, y, {
      align: 'center',
      width: contentW,
    });
    y += doc.heightOfString(ticket.eventTitle, { width: contentW, fontSize: 18 }) + 12;

    // Gold divider
    doc.moveTo(margin, y).lineTo(W - margin, y).lineWidth(1.5).strokeColor(rgbStr(GOLD)).stroke();
    y += 16;

    // --- Details Section ---
    const eventDate = new Date(ticket.eventDate);
    const dateStr = eventDate.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = eventDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    const seatDisplay = ticket.row ? `${ticket.row}${ticket.number}` : ticket.zone || '\u2014';

    const details = [
      ['Ticket Holder', ticket.buyerName],
      ['Date', dateStr],
      ['Time', timeStr],
      ['Location', ticket.eventVenue],
      ['Seat / Zone', seatDisplay],
      ['Ticket ID', shortId],
      ['Amount Paid', `$${ticket.price}`],
    ];

    for (const [label, value] of details) {
      // Label
      doc.font('Helvetica').fontSize(9).fillColor(rgbStr(MID_GRAY));
      doc.text(label, margin, y, { continued: false });

      // Value
      doc.font('Helvetica-Bold').fontSize(11).fillColor(rgbStr(DARK));
      doc.text(String(value), margin + 130, y - 11.5, { width: contentW - 130 });

      y += 20;
    }
    y += 4;

    // Gold divider
    doc.moveTo(margin, y).lineTo(W - margin, y).lineWidth(1.5).strokeColor(rgbStr(GOLD)).stroke();
    y += 14;

    // --- QR Code ---
    const qrSize = 115;
    const qrX = (W - qrSize) / 2;
    doc.image(qrPngBuffer, qrX, y, { width: qrSize, height: qrSize });
    y += qrSize + 10;

    // Scan instruction
    doc.font('Helvetica').fontSize(7).fillColor(rgbStr(MID_GRAY));
    doc.text('Scan to download this ticket', 0, y, { align: 'center', width: W });
    y += 16;

    // Gold divider
    doc.moveTo(margin, y).lineTo(W - margin, y).lineWidth(1.5).strokeColor(rgbStr(GOLD)).stroke();
    y += 14;

    // --- Footer ---
    doc.font('Helvetica').fontSize(9).fillColor(rgbStr(MID_GRAY));
    doc.text('Please present this ticket at the event entrance.', 0, y, { align: 'center', width: W });
    y += 16;

    doc.font('Helvetica-Bold').fontSize(8).fillColor(rgbStr(GOLD));
    doc.text('Powered by EventSphere', 0, y, { align: 'center', width: W });

    doc.end();
  });
}

function rgbStr([r, g, b]) {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

module.exports = generateTicketPDF;
