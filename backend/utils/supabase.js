// utils/supabase.js — Supabase Storage client for ticket PDF uploads
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'tickets';

let supabase = null;

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }
  return supabase;
}

/**
 * Upload a ticket PDF buffer to Supabase Storage.
 * @param {string} fileName — e.g. "ES_A1B2C3D4.pdf"
 * @param {Buffer} pdfBuffer
 * @returns {string|null} public URL or null on failure
 */
async function uploadTicketPDF(fileName, pdfBuffer) {
  const client = getClient();
  if (!client) {
    console.warn('[Supabase] Not configured — skipping PDF upload');
    return null;
  }

  const { error } = await client.storage
    .from(BUCKET)
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('[Supabase] Upload failed:', error.message);
    return null;
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(fileName);
  return data?.publicUrl || null;
}

/**
 * Build the expected public URL for a ticket PDF (without uploading).
 * Useful for embedding in QR codes before the upload completes.
 */
function getExpectedPdfUrl(fileName) {
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
}

module.exports = { uploadTicketPDF, getExpectedPdfUrl };
