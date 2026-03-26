// utils/generateTicketPDF.js — Premium EventSphere ticket PDF (no QR)
const PDFDocument = require('pdfkit');

// ── Design tokens ─────────────────────────────────
const DARK        = '#08080f';
const NAVY        = '#0f0f1e';
const CARD_BG     = '#13131f';
const GOLD        = '#c9a84c';
const GOLD_LIGHT  = '#e8c96e';
const GOLD_DIM    = '#8b6914';
const WHITE       = '#e8e2d0';
const MUTED       = '#9ca3af';
const GREEN       = '#4caf7d';
const BLUE        = '#5c8ce0';
const RED         = '#e05c5c';
const BORDER      = '#2a2a3d';

// Category accent colours
const CAT_COLORS = {
  'Concert / Music': '#d878d8',
  'Sports':          '#4caf7d',
  'Conference':      '#5c8ce0',
  'Workshop':        '#e09a4c',
  'Theater':         '#c9a84c',
  'Festival':        '#e05c5c',
  'Webinar':         '#4cb8c9',
  'Charity Gala':    '#af4c8c',
};

function catColor(category) {
  return CAT_COLORS[category] || GOLD;
}

function formatINR(price) {
  if (!price || price === 0) return 'FREE';
  return '\u20B9' + Number(price).toLocaleString('en-IN');
}

// Draw a filled rounded rectangle (PDFKit doesn't have roundRect natively)
function roundRect(doc, x, y, w, h, r, fillColor, strokeColor, strokeWidth) {
  doc.save();
  doc.moveTo(x + r, y)
     .lineTo(x + w - r, y)
     .quadraticCurveTo(x + w, y, x + w, y + r)
     .lineTo(x + w, y + h - r)
     .quadraticCurveTo(x + w, y + h, x + w - r, y + h)
     .lineTo(x + r, y + h)
     .quadraticCurveTo(x, y + h, x, y + h - r)
     .lineTo(x, y + r)
     .quadraticCurveTo(x, y, x + r, y)
     .closePath();
  if (fillColor)   { doc.fillColor(fillColor); }
  if (strokeColor) { doc.strokeColor(strokeColor).lineWidth(strokeWidth || 1); }
  if (fillColor && strokeColor) doc.fillAndStroke();
  else if (fillColor)           doc.fill();
  else if (strokeColor)         doc.stroke();
  doc.restore();
}

// Draw dashed line
function dashedLine(doc, x1, y1, x2, y2, dash, gap, color, width) {
  doc.save().dash(dash, { space: gap }).moveTo(x1, y1).lineTo(x2, y2)
     .strokeColor(color).lineWidth(width).stroke().undash().restore();
}

async function generateTicketPDF(ticket, qrUrl) {
  return new Promise((resolve, reject) => {
    // A5 portrait: 419 x 595 pt
    const doc = new PDFDocument({ size: [419, 595], margin: 0, compress: false });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W  = 419;
    const H  = 595;
    const LM = 28;  // left margin
    const RM = 28;  // right margin
    const CW = W - LM - RM;

    const accentColor = catColor(ticket.eventCategory || '');
    const shortId     = (ticket.id || '').substring(0, 8).toUpperCase();
    const eventDate   = new Date(ticket.eventDate);
    const dateStr     = eventDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr     = eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const seatDisplay = ticket.row
      ? `Row ${ticket.row}, Seat ${ticket.number}`
      : (ticket.zone || 'General Admission');
    const priceDisplay = formatINR(ticket.price);

    // ══════════════════════════════════════
    // 1. FULL DARK BACKGROUND
    // ══════════════════════════════════════
    doc.rect(0, 0, W, H).fill(DARK);

    // Subtle noise / grid texture (light dots)
    for (let gx = 0; gx < W; gx += 22) {
      for (let gy = 0; gy < H; gy += 22) {
        doc.save().circle(gx, gy, 0.5).fillColor(BORDER).fill().restore();
      }
    }

    // ══════════════════════════════════════
    // 2. HEADER GRADIENT BAND
    // ══════════════════════════════════════
    doc.rect(0, 0, W, 120).fill(NAVY);

    // Decorative circle (globe hint) top-right
    doc.save()
       .circle(W + 20, 30, 110)
       .fillColor(accentColor).fillOpacity(0.07).fill()
       .fillOpacity(1).restore();
    doc.save()
       .circle(W - 20, -10, 80)
       .strokeColor(GOLD).lineWidth(0.5).strokeOpacity(0.2).stroke()
       .strokeOpacity(1).restore();

    // Gold top bar
    doc.rect(0, 0, W, 3).fill(GOLD);

    // EventSphere logo text
    doc.font('Helvetica-Bold').fontSize(26).fillColor(GOLD);
    doc.text('EventSphere', LM, 22, { width: CW, align: 'left', lineBreak: false });

    // "DIGITAL TICKET" pill
    roundRect(doc, W - LM - 82, 26, 82, 18, 4, accentColor);
    doc.font('Helvetica-Bold').fontSize(7).fillColor(DARK);
    doc.text('DIGITAL TICKET', W - LM - 82, 31.5, { width: 82, align: 'center', lineBreak: false });

    // Ticket ID monospace
    doc.font('Helvetica').fontSize(8).fillColor(MUTED);
    doc.text(`# ${shortId}`, LM, 54, { lineBreak: false });

    // Category badge
    if (ticket.eventCategory) {
      const catW = doc.widthOfString(ticket.eventCategory, { fontSize: 8 }) + 16;
      roundRect(doc, LM, 64, catW, 14, 3, 'transparent', accentColor, 0.8);
      doc.font('Helvetica-Bold').fontSize(7).fillColor(accentColor);
      doc.text(ticket.eventCategory.toUpperCase(), LM + 8, 67.5, { lineBreak: false });
    }

    // Gold divider at bottom of header
    doc.moveTo(0, 118).lineTo(W, 118).lineWidth(2).strokeColor(GOLD).stroke();
    doc.moveTo(0, 120).lineTo(W, 120).lineWidth(1).strokeColor(GOLD_DIM).strokeOpacity(0.4).stroke().strokeOpacity(1);

    // ══════════════════════════════════════
    // 3. EVENT TITLE SECTION
    // ══════════════════════════════════════
    let y = 132;

    doc.font('Helvetica-Bold').fontSize(17).fillColor(WHITE);
    const titleH = doc.heightOfString(ticket.eventTitle || 'Event', { width: CW, lineBreak: true });
    doc.text(ticket.eventTitle || 'Event', LM, y, { width: CW, align: 'left', lineBreak: true });
    y += titleH + 6;

    // Thin gold underline
    doc.moveTo(LM, y).lineTo(LM + 60, y).lineWidth(2).strokeColor(accentColor).stroke();
    y += 14;

    // ══════════════════════════════════════
    // 4. DETAILS GRID (2-column label | value)
    // ══════════════════════════════════════
    const LABEL_W = 100;
    const VALUE_X = LM + LABEL_W + 8;
    const VALUE_W = CW - LABEL_W - 8;
    const ROW_H   = 28;

    const details = [
      { label: 'Ticket Holder', value: ticket.buyerName || '—',   icon: '●', color: BLUE },
      { label: 'Date',          value: dateStr,                    icon: '●', color: accentColor },
      { label: 'Time',          value: timeStr,                    icon: '●', color: accentColor },
      { label: 'Venue',         value: ticket.eventVenue || '—',   icon: '●', color: GREEN },
      { label: 'Seat / Zone',   value: seatDisplay,                icon: '●', color: RED },
      { label: 'Amount Paid',   value: priceDisplay,               icon: '●', color: GREEN },
    ];

    for (let i = 0; i < details.length; i++) {
      const { label, value, color } = details[i];
      const rowY = y + i * ROW_H;

      // Alternating row background
      if (i % 2 === 0) {
        roundRect(doc, LM - 6, rowY - 4, CW + 12, ROW_H, 4, '#111122');
      }

      // Left accent dot
      doc.save().circle(LM, rowY + 9, 2.5).fillColor(color).fill().restore();

      // Label
      doc.font('Helvetica').fontSize(8).fillColor(MUTED);
      doc.text(label, LM + 8, rowY + 3, { width: LABEL_W, lineBreak: false });

      // Separator
      doc.moveTo(LM + LABEL_W + 2, rowY + 2)
         .lineTo(LM + LABEL_W + 2, rowY + ROW_H - 6)
         .lineWidth(0.5).strokeColor(BORDER).stroke();

      // Value
      const isMoney  = label === 'Amount Paid';
      const isHolder = label === 'Ticket Holder';
      const valSize  = isMoney ? 13 : isHolder ? 11 : 10;
      const valColor = isMoney ? GREEN : isHolder ? WHITE : WHITE;
      doc.font('Helvetica-Bold').fontSize(valSize).fillColor(valColor);
      doc.text(String(value), VALUE_X, rowY + (isMoney ? 1 : 3), { width: VALUE_W, lineBreak: false });
    }

    y += details.length * ROW_H + 10;

    // ══════════════════════════════════════
    // 5. TEAR-LINE (dashed separator)
    // ══════════════════════════════════════
    // Left semi-circle cutout
    doc.save().circle(0, y + 8, 10).fillColor(DARK).fill().restore();
    doc.save().circle(W, y + 8, 10).fillColor(DARK).fill().restore();
    dashedLine(doc, 10, y + 8, W - 10, y + 8, 6, 4, GOLD_DIM, 1.2);

    doc.font('Helvetica').fontSize(7).fillColor(GOLD_DIM);
    doc.text('─ ─ ─  VALID ENTRY TICKET  ─ ─ ─', 0, y + 2, { align: 'center', width: W, lineBreak: false });
    y += 24;

    // ══════════════════════════════════════
    // 6. TICKET STUB (bottom section)
    // ══════════════════════════════════════
    roundRect(doc, LM - 6, y, CW + 12, H - y - 20, 8, NAVY, GOLD_DIM, 0.5);

    y += 14;

    // ✓ VALID badge
    const badgeX = (W - 80) / 2;
    roundRect(doc, badgeX, y, 80, 22, 6, GREEN);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK);
    doc.text('✓  VALID', badgeX, y + 5.5, { width: 80, align: 'center', lineBreak: false });
    y += 32;

    // Event name (stub)
    doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
    doc.text(ticket.eventTitle || 'Event', LM, y, { width: CW, align: 'center', lineBreak: false });
    y += 18;

    // Seat highlight box
    roundRect(doc, LM + CW/2 - 70, y, 140, 20, 5, accentColor + '22', accentColor, 0.8);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(accentColor);
    doc.text(seatDisplay, LM + CW/2 - 70, y + 5.5, { width: 140, align: 'center', lineBreak: false });
    y += 30;

    // Two-column stub info: Date | Ticket ID
    const halfW = CW / 2;
    // Date box
    roundRect(doc, LM, y, halfW - 6, 36, 5, '#111122');
    doc.font('Helvetica').fontSize(7).fillColor(MUTED);
    doc.text('DATE', LM, y + 6, { width: halfW - 6, align: 'center', lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(WHITE);
    doc.text(eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
             LM, y + 17, { width: halfW - 6, align: 'center', lineBreak: false });

    // Ticket ID box
    roundRect(doc, LM + halfW + 6, y, halfW - 6, 36, 5, '#111122');
    doc.font('Helvetica').fontSize(7).fillColor(MUTED);
    doc.text('TICKET ID', LM + halfW + 6, y + 6, { width: halfW - 6, align: 'center', lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD);
    doc.text(shortId, LM + halfW + 6, y + 17, { width: halfW - 6, align: 'center', lineBreak: false });

    y += 46;

    // Bottom gold line
    doc.moveTo(LM, y).lineTo(W - RM, y).lineWidth(0.8).strokeColor(GOLD_DIM).strokeOpacity(0.5).stroke().strokeOpacity(1);
    y += 8;

    // "Present this ticket" instruction
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
    doc.text('Present this ticket at the event entrance for verification.', LM, y, { width: CW, align: 'center', lineBreak: false });
    y += 14;

    // Powered by EventSphere
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD);
    doc.text('Powered by EventSphere', 0, y, { width: W, align: 'center', lineBreak: false });

    // ══════════════════════════════════════
    // 7. BOTTOM GOLD BAR
    // ══════════════════════════════════════
    doc.rect(0, H - 4, W, 4).fill(GOLD);

    doc.end();
  });
}

module.exports = generateTicketPDF;